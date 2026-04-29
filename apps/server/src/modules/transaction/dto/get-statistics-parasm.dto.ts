import { Type } from "class-transformer";
import { IsDate, IsMongoId, IsNotEmpty } from "class-validator";

export class GetStatisticsParamsDto {
  @IsNotEmpty()
  @IsMongoId()
  walletId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  fromDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  toDate: Date;
}