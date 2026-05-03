import { CreateWalletDto } from "@/modules/wallet/dto/create-wallet.dto";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, QueryFilter, QueryOptions, Types } from "mongoose";
import { Wallet } from "../entities/wallet.entity";
import { BaseRepositoryAbstract, BaseRepositoryInterface, FindAllResponse, RepositoryOptions } from "./base.repository";

export interface WalletRepositoryInterface extends BaseRepositoryInterface<Wallet> { }



@Injectable()
export class WalletRepository extends BaseRepositoryAbstract<Wallet> implements WalletRepositoryInterface {
  constructor(
    @InjectModel(Wallet.name) private walletRepository: Model<Wallet>
  ) {
    super(walletRepository);
  }
  
  private toAggregateObjectId(value: unknown): Types.ObjectId | unknown {
    if (typeof value === "string" && Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    return value;
  }

  private buildWalletAggregateMatch(condition: QueryFilter<Wallet>): QueryFilter<Wallet> {
    const next = { ...(condition as Record<string, unknown>) };
    if (Object.hasOwn(next, "id") && next.id != null) {
      const idVal = next.id;
      delete next.id;
      next._id = this.toAggregateObjectId(idVal);
    }
    if (next._id != null) {
      next._id = this.toAggregateObjectId(next._id);
    }
    if (next.user != null) {
      next.user = this.toAggregateObjectId(next.user);
    }
    return next as QueryFilter<Wallet>;
  }

  override async create(dto: CreateWalletDto & { userId: string }, options?: RepositoryOptions): Promise<Wallet> {
    const createdWallet = new this.walletRepository({
      ...dto,
      user: new Types.ObjectId(dto.userId),
    });
    const savedWallet = await createdWallet.save(options);
    return savedWallet.toJSON<Wallet>({ virtuals: true });
  }

  override async findOneByCondition(condition: QueryFilter<Wallet>, options?: RepositoryOptions): Promise<Wallet | null> {
    const match = this.buildWalletAggregateMatch(condition);
    const agg = this.walletRepository.aggregate([{ $match: match }, { $limit: 1 }]);
    if (options?.session) {
      agg.session(options.session);
    }
    const rows = await agg.exec();
    const raw = rows[0];
    if (raw == null) {
      return null;
    }
    return this.walletRepository.hydrate(raw).toJSON<Wallet>({ virtuals: true });
  }

  override async findOneById(id: string, options?: RepositoryOptions): Promise<Wallet | null> {
    const agg = this.walletRepository.aggregate([
      { $match: { _id: new Types.ObjectId(id), deletedAt: null } },
      { $limit: 1 },
    ]);
    if (options?.session) {
      agg.session(options.session);
    }
    const wallet = await agg.exec();
    const raw = wallet[0];
    if (raw == null) {
      return null;
    }
    return this.walletRepository.hydrate(raw).toJSON<Wallet>({ virtuals: true });
  }

  async getTotalBalance(userId: string): Promise<number> {
    const match = this.buildWalletAggregateMatch({
      user: new Types.ObjectId(userId),
      deletedAt: null,
    });
    const [row] = await this.walletRepository
      .aggregate<{ total: number }>([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ])
      .exec();
    return row?.total ?? 0;
  }

  async getWalletCount(userId: string): Promise<number> {
    const [row] = await this.walletRepository
      .aggregate<{ count: number }>([
        { $match: { user: new Types.ObjectId(userId), deletedAt: null } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .exec();
    return row?.count ?? 0;
  }

  override async findAll(
    condition: QueryFilter<Wallet> & { priorityId?: Types.ObjectId },
    options?: QueryOptions<Wallet>,
    repositoryOptions?: RepositoryOptions,
  ): Promise<FindAllResponse<Wallet>> {
    const { priorityId, ...matchCondition } = condition;

    if (!priorityId) {
      return super.findAll(matchCondition, options, repositoryOptions);
    }

    const session = repositoryOptions?.session;

    const rawUserSort: Record<string, 1 | -1> =
      options?.sort &&
        typeof options.sort === "object" &&
        !Array.isArray(options.sort)
        ? { ...(options.sort as Record<string, 1 | -1>) }
        : { _id: -1 };

    const { _prioritySort: _reserved, ...baseUserSort } = rawUserSort;

    const sortStage: Record<string, 1 | -1> = {
      _prioritySort: 1,
      ...baseUserSort,
    };

    const pipeline: PipelineStage[] = [
      { $match: matchCondition },
      {
        $addFields: {
          _prioritySort: {
            $cond: [{ $eq: ["$_id", priorityId] }, 0, 1],
          },
        },
      },
      { $sort: sortStage },
    ];

    if (options?.skip != null) {
      pipeline.push({ $skip: options.skip });
    }
    if (options?.limit != null) {
      pipeline.push({ $limit: options.limit });
    }

    const agg = this.walletRepository.aggregate(pipeline);
    if (session) {
      agg.session(session);
    }

    const [count, rawItems] = await Promise.all([
      this.walletRepository.aggregate<{ count: number }>([
        { $match: matchCondition },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]).exec(),
      agg.exec(),
    ]);

    const items = rawItems.map((doc) => {
      const { _prioritySort: _p, ...rest } = doc;
      const hydrated = this.walletRepository.hydrate(rest);
      return hydrated.toJSON<Wallet>({ virtuals: true });
    });

    return { count: count[0]?.count ?? 0, items };
  }

}