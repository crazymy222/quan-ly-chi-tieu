import { DEFAULT_ORDER, DEFAULT_PAGE, DEFAULT_SORT_FIELD, DEFAULT_TAKE, Order } from '@/common/constants/pagination.const';
import { redisKey } from '@/common/constants/redis.const';
import { Transaction, TransactionType } from '@/common/entities/transaction.entity';
import { TransactionRepository } from '@/common/repositories/transaction.repository';
import { WalletRepository } from '@/common/repositories/wallet.repository';
import { CachedService } from '@/libs/cached/cached.service';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Connection, QueryFilter, Types } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionHistoryParamsDto } from './dto/get-transaction-history-params.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { GetStatisticsParamsDto } from './dto/get-statistics-parasm.dto';
import { randomUUID } from 'crypto';
import { UserRepository } from '@/common/repositories/user.repository';
import { TRANSACTION_CATEGORIES } from '@/common/constants/transaction.const';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletRepository: WalletRepository,
    private readonly cachedService: CachedService,
    private readonly userRepository: UserRepository,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async create(createTransactionDto: CreateTransactionDto, userId: string,) {
    const { amount, transactionCategory, note, walletId, recieverId, } = createTransactionDto;

    const myWallet = await this.walletRepository.findOneByCondition({
      id: walletId,
      user: userId,
      deletedAt: null,
    });

    const recieverWallet = await this.userRepository.getDefaultWallet(recieverId);

    if (!myWallet || !recieverWallet) {
      throw new BadRequestException('Invalid transaction: Wallets not found');
    }

    if (myWallet.balance < amount) {
      throw new BadRequestException('Invalid transaction: Insufficient balance');
    }

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const transferId = randomUUID();

        await this.transactionRepository.create(
          {
            amount,
            note,
            runningBalance: myWallet.balance - amount,
            transactionCategory,
            transactionType: TransactionType.EXPENSE,
            walletId,
            userId,
            transferId,
          },
          { session },
        );

        await this.transactionRepository.create(
          {
            amount,
            note,
            runningBalance: recieverWallet.balance + amount,
            transactionCategory: TRANSACTION_CATEGORIES.OTHER,
            transactionType: TransactionType.INCOME,
            walletId: recieverWallet.id,
            userId: recieverId,
            transferId,
          },
          { session },
        );

        await this.walletRepository.findOneAndUpdate(
          { _id: myWallet.id, user: new Types.ObjectId(userId) },
          { balance: myWallet.balance - amount },
          { session },
        );

        await this.walletRepository.findOneAndUpdate(
          { _id: recieverWallet.id, user: new Types.ObjectId(recieverId) },
          { balance: recieverWallet.balance + amount },
          { session },
        );
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log("error", error);

      throw new InternalServerErrorException('Failed to create transaction');
    } finally {
      await session.endSession();
    }

    const walletByIdKey = redisKey.getWalletByIdKey(userId, createTransactionDto.walletId);
    const totalBalanceKey = redisKey.getTotalBalanceKey(userId);
    const walletsKey = redisKey.getWalletsKey(userId);

    await Promise.allSettled([
      this.cachedService.del(walletByIdKey),
      this.cachedService.del(totalBalanceKey),
      this.cachedService.del(walletsKey),
    ])

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
          fromDate,
          toDate,
        }),
        this.transactionRepository.getTotalTransactionAmount({
          user: userId,
          transactionType: TransactionType.EXPENSE,
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
    const {
      page,
      take,
      sortField,
      order,
      fromDate,
      toDate,
      walletId
    } = getTransactionHistoryParamsDto;

    const condition: QueryFilter<Transaction> = {
      user: new Types.ObjectId(userId),
      deletedAt: null,
    };
    if (walletId) {
      condition.wallet = new Types.ObjectId(walletId);
    }
    if (fromDate) {
      condition.fromDate = fromDate;
    }
    if (toDate) {
      condition.toDate = toDate;
    }

    const transactions = await this.transactionRepository.findAll(condition, {
      skip: ((page ?? DEFAULT_PAGE) - 1) * (take ?? DEFAULT_TAKE),
      limit: take ?? DEFAULT_TAKE,
      sort: { [sortField ?? DEFAULT_SORT_FIELD]: (order ?? DEFAULT_ORDER) === Order.ASC ? 1 : -1 },
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
        fromDate,
        wallet: walletId,
        toDate,
      }),
      this.transactionRepository.getTotalTransactionAmount({
        user: userId,
        transactionType: TransactionType.EXPENSE,
        fromDate,
        wallet: walletId,
        toDate,
      }),
    ]).catch(() => {
      throw new InternalServerErrorException('Failed to get statistics');
    });
    return { totalIncome, totalExpense };
  }

  async getDetailTransaction(id: string, userId: string) {
    const transaction = await this.transactionRepository.getDetailTransaction(id, userId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    const peerUser = await this.transactionRepository.findPeerUserByTransfer(
      transaction.transferId,
      userId,
    );

    return {
      ...transaction,
      peerUser: peerUser ? {
        id: peerUser?.id,
        displayName: peerUser?.displayName,
        email: peerUser?.email,
      } : null
    }
  }
}