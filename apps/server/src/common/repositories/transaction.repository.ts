import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, QueryFilter, QueryOptions, Types } from "mongoose";
import { DEFAULT_SORT_FIELD, DEFAULT_TAKE } from "../constants/pagination.const";
import { Transaction, TransactionType } from "../entities/transaction.entity";
import { User } from "../entities/user.entity";
import { BaseRepositoryAbstract, BaseRepositoryInterface, FindAllResponse, RepositoryOptions } from "./base.repository";

export interface TransactionRepositoryInterface extends BaseRepositoryInterface<Transaction> { }

@Injectable()
export class TransactionRepository extends BaseRepositoryAbstract<Transaction> implements TransactionRepositoryInterface {
  constructor(
    @InjectModel(Transaction.name) private transactionRepository: Model<Transaction>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super(transactionRepository);
  }

  override async create(
    data: {
      transferId: string;
      amount: number;
      walletId: string;
      userId: string;
      runningBalance: number;
      note: string | null;
      transactionCategory: string;
      transactionType: TransactionType;
    },
    options?: RepositoryOptions
  ): Promise<Transaction> {
    const createdTransaction = new this.transactionRepository({
      ...data,
      user: new Types.ObjectId(data.userId),
      wallet: new Types.ObjectId(data.walletId),
    });
    const savedTransaction = await createdTransaction.save(options);
    return savedTransaction.toJSON<Transaction>({ virtuals: true });
  }

  private createdAtHalfOpenRange(fromDate?: Date, toDate?: Date): { $gte?: Date; $lt?: Date } | undefined {
    if (!fromDate && !toDate) return undefined;
    return {
      ...(fromDate ? { $gte: fromDate } : {}),
      ...(toDate ? { $lt: toDate } : {}),
    };
  }

  async getTotalTransactionAmount(
    condition: {
      user: string;
      transactionType: TransactionType;
      fromDate?: Date;
      toDate?: Date;
      wallet?: string;
    }
  ): Promise<number> {
    const { user, transactionType, fromDate, toDate, wallet } = condition;
    const createdAt = this.createdAtHalfOpenRange(fromDate, toDate);
    const match: QueryFilter<Transaction> = {
      transactionType,
      deletedAt: null,
      user: new Types.ObjectId(user),
      ...(wallet ? { wallet: new Types.ObjectId(wallet) } : {}),
      ...(createdAt ? { createdAt } : {}),
    };

    const [result] = await this.transactionRepository
      .aggregate<{ total: number }>([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .exec();
    return result?.total ?? 0;
  }

  override async findAll(
    condition: QueryFilter<Transaction> & { fromDate?: Date; toDate?: Date },
    options?: QueryOptions<Transaction>,
  ): Promise<FindAllResponse<Transaction>> {
    const { fromDate, toDate, ...rest } = { ...condition };
    const createdAt = this.createdAtHalfOpenRange(fromDate, toDate);
    const match: QueryFilter<Transaction> = {
      ...rest,
      ...(createdAt ? { createdAt } : {}),
    };

    const [count, items] = await Promise.all([
      this.transactionRepository
        .aggregate([
          { $match: match },
          { $group: { _id: null, count: { $sum: 1 } } },
        ])
        .exec(),
      this.transactionRepository
        .aggregate<Transaction[]>([
          { $match: match },
          { $sort: options?.sort ?? { [DEFAULT_SORT_FIELD]: -1 } },
          { $skip: options?.skip ?? 0 },
          { $limit: options?.limit ?? DEFAULT_TAKE },
          {
            $lookup: {
              from: 'wallets',
              let: { walletId: '$wallet' },
              pipeline: [
                { $match: { $expr: { $eq: ['$$walletId', '$_id'] } } },
              ],
              as: 'wallet'
            },
          },
          { $unwind: '$wallet' },
        ])
        .exec(),
    ]);

    const hydratedItems = items.map((doc) => this.transactionRepository.hydrate(doc));
    const jsonItems = hydratedItems.map((doc) => doc.toJSON<Transaction>({ virtuals: true }));
    return { count: count[0]?.count ?? 0, items: jsonItems };
  }

  async getDetailTransaction(id: string, userId: string): Promise<Transaction | null> {
    const [transaction] = await this.transactionRepository
      .aggregate([
        { $match: { _id: new Types.ObjectId(id), user: new Types.ObjectId(userId), deletedAt: null } },
        { $limit: 1 },
      ])
      .exec();
    if (!transaction) {
      return null;
    }
    return this.transactionRepository.hydrate(transaction).toJSON<Transaction>({ virtuals: true });
  }

  async findPeerUserByTransfer(transferId: string, excludeUserId: string): Promise<User | null> {
    const [peerUserDoc] = await this.transactionRepository
      .aggregate([
        {
          $match: {
            transferId,
            user: { $ne: new Types.ObjectId(excludeUserId) },
            deletedAt: null,
          },
        },
        { $limit: 1 },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [
              { $match: { deletedAt: null } },
              { $project: { password: 0 } },
            ],
            as: 'peerUser',
          },
        },
        { $unwind: { path: '$peerUser', preserveNullAndEmptyArrays: false } },
        { $replaceRoot: { newRoot: '$peerUser' } },
      ])
      .exec();

    if (!peerUserDoc) {
      return null;
    }

    return this.userModel.hydrate(peerUserDoc).toJSON<User>({ virtuals: true });
  }
}