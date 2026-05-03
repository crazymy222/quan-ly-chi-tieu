import { Transaction } from "@/common/entities/transaction.entity";
import { GetOneWalletResponseDto } from "@/modules/wallet/dto/get-one-wallet-response.dto";
import { Exclude, Expose, Type, Transform } from "class-transformer";
import mongoose from "mongoose";

type GetOneTransactionResponseShape = Omit<
  Partial<Transaction>,
  "wallet"
> & {
  wallet: GetOneWalletResponseDto;
};

export class GetOneTransactionResponseDto implements GetOneTransactionResponseShape {
  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null ;
  
  @Expose({ name: "userId", toPlainOnly: true })
  @Transform(({ value }) => value?.toString())
  declare user: mongoose.Types.ObjectId;

  @Type(() => GetOneWalletResponseDto)
  wallet: GetOneWalletResponseDto;

  @Type(() => String)
  transferId: string;
}

