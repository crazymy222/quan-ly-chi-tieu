import { Transaction } from "@/common/entities/transaction.entity";
import { GetOneWalletResponseDto } from "@/modules/wallet/dto/get-one-wallet-response.dto";
import { Exclude, Expose, Transform, Type } from "class-transformer";
import mongoose from "mongoose";
import { GetOneTransactionResponseDto } from "./get-one-transaction-response.dto";

export class GetManyTransactionResponseDto {
  count: number;

  @Type(() => GetOneTransactionResponseDto)
  items: GetOneTransactionResponseDto[];
}

