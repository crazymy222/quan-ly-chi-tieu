import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, QueryFilter, QueryOptions, Types } from "mongoose";
import { BaseRepositoryAbstract, BaseRepositoryInterface, FindAllResponse, RepositoryOptions } from "./base.repository";
import { Transaction, TransactionType } from "../entities/transaction.entity";
import { CreateTransactionDto } from "@/modules/transaction/dto/create-transaction.dto";

export interface TransactionRepositoryInterface extends BaseRepositoryInterface<Transaction> { }

@Injectable()
export class TransactionRepository extends BaseRepositoryAbstract<Transaction> implements TransactionRepositoryInterface {
  constructor(
    @InjectModel(Transaction.name) private transactionRepository: Model<Transaction>,
  ) {
    super(transactionRepository);
  }

  override async create(dto: CreateTransactionDto & { userId: string, runningBalance: number }, options?: RepositoryOptions): Promise<Transaction> {
    const createdTransaction = new this.transactionRepository({
      ...dto,
      user: new Types.ObjectId(dto.userId),
      wallet: new Types.ObjectId(dto.walletId),
      runningBalance: dto.runningBalance,
    });
    const savedTransaction = await createdTransaction.save(options);
    return savedTransaction.toJSON<Transaction>({ virtuals: true });
  }

  async getTotalTransactionAmount(
    condition: QueryFilter<Transaction> & { fromDate?: Date; toDate?: Date }
  ): Promise<number> {
    const { fromDate, toDate, ...rest } = { ...condition };
    const match: QueryFilter<Transaction> = { ...rest };

    if (typeof match.user === 'string') {
      match.user = new Types.ObjectId(match.user);
    }
    if (typeof match.wallet === 'string') {
      match.wallet = new Types.ObjectId(match.wallet);
    }

    if (fromDate || toDate) {
      const range: { $gte?: Date; $lt?: Date } = {};
      if (fromDate) range.$gte = fromDate;
      if (toDate) range.$lt = toDate;
      match.transactionDate = range;
    }

    const result = await this.transactionRepository
      .aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }])
      .exec();
    return result[0]?.total ?? 0;
  }

  override async findAll(
    condition: QueryFilter<Transaction>,
    options?: QueryOptions<Transaction>,
    repositoryOptions?: RepositoryOptions,
  ): Promise<FindAllResponse<Transaction>> {
    const [count, items] = await Promise.all([
      this.transactionRepository.countDocuments(condition, repositoryOptions).exec(),
      this.transactionRepository.find(condition, options?.projection, { ...options, session: repositoryOptions?.session }).populate('wallet').exec(),
    ]);
    return { count, items: items.map(item => item.toJSON<Transaction>({ virtuals: true })) };
  }
}