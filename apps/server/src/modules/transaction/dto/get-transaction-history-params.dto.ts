import { PaginationOptionsDto } from "@/common/dtos/pagination-options.dto";
import { Transform } from "class-transformer";
import { IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GetTransactionHistoryParamsDto extends PaginationOptionsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  walletId?: string;
  
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  fromDate?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  toDate?: Date;
}