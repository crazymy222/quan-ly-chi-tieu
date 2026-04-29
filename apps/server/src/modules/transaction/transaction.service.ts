import { Order } from '@/common/constants/pagination.const';
import { redisKey } from '@/common/constants/redis.const';
import { Transaction, TransactionType } from '@/common/entities/transaction.entity';
import { TransactionRepository } from '@/common/repositories/transaction.repository';
import { WalletRepository } from '@/common/repositories/wallet.repository';
import { CachedService } from '@/libs/cached/cached.service';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Connection, QueryFilter, Types } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionHistoryParamsDto } from './dto/get-transaction-history-params.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { GetStatisticsParamsDto } from './dto/get-statistics-parasm.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletRepository: WalletRepository,
    private readonly cachedService: CachedService,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const variation = createTransactionDto.transactionType === TransactionType.INCOME
      ? createTransactionDto.amount
      : -createTransactionDto.amount;

    const walletFilter: QueryFilter<any> = {
      _id: new Types.ObjectId(createTransactionDto.walletId),
      user: new Types.ObjectId(userId),
      deletedAt: null,
    };
    if (createTransactionDto.transactionType === TransactionType.EXPENSE) {
      walletFilter.balance = { $gte: createTransactionDto.amount };
    }

    const updatedWallet = await this.walletRepository.findOneAndUpdate(
      walletFilter,
      { $inc: { balance: variation } },
    );

    if (!updatedWallet) {
      throw new BadRequestException('Wallet not found or insufficient balance');
    }
    const walletByIdKey = redisKey.getWalletByIdKey(userId, createTransactionDto.walletId);
    const totalBalanceKey = redisKey.getTotalBalanceKey(userId);
    const walletsKey = redisKey.getWalletsKey(userId);

    await Promise.allSettled([
      this.cachedService.del(walletByIdKey),
      this.cachedService.del(totalBalanceKey),
      this.cachedService.del(walletsKey),
    ])

    return this.transactionRepository.create({ ...createTransactionDto, userId, runningBalance: updatedWallet.balance });
  }

  async getTotalIncomeAndExpense(userId: string) {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    const fromDate = new Date(Date.UTC(y, m, 1));
    const toDate = new Date(Date.UTC(y, m + 1, 1));

    try {
      const [totalIncome, totalExpense] = await Promise.all([
        this.transactionRepository.getTotalTransactionAmount({
          user: userId,
          transactionType: TransactionType.INCOME,
          deletedAt: null,
          fromDate,
          toDate,
        }),
        this.transactionRepository.getTotalTransactionAmount({
          user: userId,
          transactionType: TransactionType.EXPENSE,
          deletedAt: null,
          fromDate,
          toDate,
        }),
      ])
      return { totalIncome, totalExpense };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get total income and expense');
    }
  }

  async getTransactionHistory(getTransactionHistoryParamsDto: GetTransactionHistoryParamsDto, userId: string) {
    const { page, take, sortField, order, fromDate, toDate, walletId } = getTransactionHistoryParamsDto;

    const condition: QueryFilter<Transaction> = {
      user: new Types.ObjectId(userId),
      deletedAt: null,
    };
    if (walletId) {
      condition.wallet = new Types.ObjectId(walletId);
    }
    if (fromDate) {
      condition.transactionDate = { $gte: fromDate };
    }
    if (toDate) {
      condition.transactionDate = { $lte: toDate };
    }

    const transactions = await this.transactionRepository.findAll(condition, {
      skip: (page - 1) * take,
      limit: take,
      sort: { [sortField]: order === Order.ASC ? 1 : -1 },
    });
    return transactions;
  }

  async getStatistics(
    getStatisticsParamsDto: GetStatisticsParamsDto,
    userId: string,
  ): Promise<{ totalIncome: number; totalExpense: number; }> {
    const { walletId, fromDate, toDate } = getStatisticsParamsDto;

    const [totalIncome, totalExpense] = await Promise.all([
      this.transactionRepository.getTotalTransactionAmount({
        user: userId,
        transactionType: TransactionType.INCOME,
        deletedAt: null,
        fromDate,
        wallet: walletId,
        toDate,
      }),
      this.transactionRepository.getTotalTransactionAmount({
        user: userId,
        transactionType: TransactionType.EXPENSE,
        deletedAt: null,
        fromDate,
        wallet: walletId,
        toDate,
      }),
    ]).catch(() => {
      throw new InternalServerErrorException('Failed to get statistics');
    });
    return { totalIncome, totalExpense };
  }
}
