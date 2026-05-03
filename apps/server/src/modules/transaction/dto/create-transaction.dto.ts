import { TransactionType } from "@/common/entities/transaction.entity";
import { TRANSACTION_CATEGORIES } from "@/common/constants/transaction.const";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsIn, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxDate, Min } from "class-validator";

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsIn(Object.values(TRANSACTION_CATEGORIES))
  transactionCategory: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  recieverId: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  note: string | null;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  walletId: string;
}
