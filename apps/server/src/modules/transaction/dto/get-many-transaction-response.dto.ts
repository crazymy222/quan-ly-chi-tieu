import { Transaction } from "@/common/entities/transaction.entity";
import { GetOneWalletResponseDto } from "@/modules/wallet/dto/get-one-wallet-response.dto";
import { Exclude, Expose, Transform, Type } from "class-transformer";
import mongoose from "mongoose";

export class GetManyTransactionResponseDto {
  count: number;

  @Type(() => GetOneTranSactionResponseDto)
  items: GetOneTranSactionResponseDto[];
}

type GetOneTransactionResponseShape = Omit<
  Partial<Transaction>,
  "wallet"
> & {
  wallet: GetOneWalletResponseDto;
};

class GetOneTranSactionResponseDto implements GetOneTransactionResponseShape {
  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date | null ;
  
  @Expose({ name: "userId", toPlainOnly: true })
  @Transform(({ value }) => value?.toString())
  declare user: mongoose.Types.ObjectId;

  @Type(() => GetOneWalletResponseDto)
  wallet: GetOneWalletResponseDto;
}

