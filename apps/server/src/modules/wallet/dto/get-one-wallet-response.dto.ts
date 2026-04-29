import { Wallet } from "@/common/entities/wallet.entity";
import { Exclude, Expose, Transform } from "class-transformer";
import mongoose from "mongoose";

export class GetOneWalletResponseDto implements Partial<Wallet> {
  @Expose({name: 'userId', toPlainOnly: true})
  @Transform(({ value }) => value?.toString())
  declare user: mongoose.Types.ObjectId;

  id: string;
  balance: number;
  name: string;
  accountNumber: string | null;
  createdAt: Date;
  
  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null;
}
