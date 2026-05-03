import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DEFAULT_PAGE, DEFAULT_SORT_FIELD, DEFAULT_TAKE, Order } from "../constants/pagination.const";
import { User } from "../entities/user.entity";
import { Wallet } from "../entities/wallet.entity";
import { BaseRepositoryAbstract, BaseRepositoryInterface } from "./base.repository";

export interface UserRepositoryInterface extends BaseRepositoryInterface<User> { }

@Injectable()
export class UserRepository extends BaseRepositoryAbstract<User> implements UserRepositoryInterface {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Wallet.name) private walletRepository: Model<Wallet>
  ) {
    super(userRepository);
  }

  async getDefaultWallet(userId: string): Promise<Wallet | null> {
    const rows = await this.userRepository
      .aggregate([
        { $match: { _id: new Types.ObjectId(userId), deletedAt: null, defaultWallet: { $ne: null } } },
        { $lookup: { from: 'wallets', localField: 'defaultWallet', foreignField: '_id', as: 'defaultWallet' } },
        { $unwind: '$defaultWallet' },
      ])
      .exec();
    return rows?.[0]?.defaultWallet
      ? this.walletRepository.hydrate(rows?.[0]?.defaultWallet).toJSON<Wallet>({ virtuals: true })
      : null;
  }

  async setDefaultWallet(userId: string, walletId: string) {
    return await this.userRepository.findOneAndUpdate({ _id: userId }, { defaultWallet: new Types.ObjectId(walletId) });
  }

  async getReceivers(
    userId: string,
    query: { search?: string },
    options?: { sortField?: string, order?: Order, page?: number, take?: number }
  ) {

    const match = {
      defaultWallet: { $ne: null },
      deletedAt: null,
      _id: { $ne: new Types.ObjectId(userId) },
      ...(query?.search ? { displayName: { $regex: query.search, $options: 'i' } } : {}),
    };

    const [count, items] = await Promise.all([
      this.userRepository
        .aggregate([
          { $match: match },
          { $group: { _id: null, count: { $sum: 1 } } },
        ])
        .exec(),
      this.userRepository
        .aggregate([
          { $match: match },
          { $sort: { [options?.sortField ?? DEFAULT_SORT_FIELD]: options?.order === Order.ASC ? 1 : -1 } },
          { $skip: ((options?.page ?? DEFAULT_PAGE) - 1) * (options?.take ?? DEFAULT_TAKE) },
          { $limit: options?.take ?? DEFAULT_TAKE },
        ])
        .exec(),
    ]);

    const hydratedItems = items.map(item => this.userRepository.hydrate(item));
    const jsonItems = hydratedItems.map(item => item.toJSON<User>({ virtuals: true }));

    return {
      count: count[0]?.count ?? 0,
      items: jsonItems
    };
  }

}