import { Type } from "class-transformer";
import { IsIn, IsOptional, IsString, Min } from "class-validator";
import { Order } from "../constants/pagination.const";

export class PaginationOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  take: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number;

  @IsOptional()
  @IsString()
  sortField: string ;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(Order))
  order: Order;
}