import { CreateWalletDto } from "@/modules/wallet/dto/create-wallet.dto";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, QueryFilter, QueryOptions, Types } from "mongoose";
import { Wallet } from "../entities/wallet.entity";
import { BaseRepositoryAbstract, BaseRepositoryInterface, RepositoryOptions } from "./base.repository";

export interface WalletRepositoryInterface extends BaseRepositoryInterface<Wallet> { }

@Injectable()
export class WalletRepository extends BaseRepositoryAbstract<Wallet> implements WalletRepositoryInterface {
  constructor(
    @InjectModel(Wallet.name) private walletRepository: Model<Wallet>
  ) {
    super(walletRepository);
   }

   override async create(dto: CreateWalletDto & { userId: string }, options?: RepositoryOptions): Promise<Wallet> {
    const createdWallet = new this.walletRepository({
      ...dto,
      user: new Types.ObjectId(dto.userId),
    });
    const savedWallet = await createdWallet.save(options);
    return savedWallet.toJSON<Wallet>({ virtuals: true });
   }

  override async findOneById(id: string, options?: RepositoryOptions): Promise<Wallet | null> {
    const wallet = await this.walletRepository.findById(id, null, options).exec();
    return wallet?.toJSON<Wallet>({ virtuals: true }) ?? null;
  }

  async getTotalBalance(userId: string): Promise<number> {
    const wallets = await this.walletRepository.find({ user:userId, deletedAt: null }).exec();
    return wallets.reduce((acc, wallet) => acc + wallet.balance, 0);
  }

  async getWalletCount(userId: string): Promise<number> {
    return await this.walletRepository.countDocuments({ user: userId, deletedAt: null }).exec();
  }
}