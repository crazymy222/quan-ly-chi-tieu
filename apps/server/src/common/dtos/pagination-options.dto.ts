import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, Min } from "class-validator";
import { DEFAULT_ORDER, DEFAULT_PAGE, DEFAULT_SORT_FIELD, DEFAULT_TAKE, Order } from "../constants/pagination.const";

export class PaginationOptionsDto {
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : DEFAULT_TAKE)
  @Min(1)
  take: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : DEFAULT_PAGE)
  @Min(1)
  page: number;

  @IsOptional()
  @Transform(({ value }) => value ? value : DEFAULT_SORT_FIELD)
  @IsString()
  sortField: string ;

  @IsOptional()
  @Transform(({ value }) => value ? value : DEFAULT_ORDER)
  @IsString()
  @IsIn(Object.values(Order))
  order: Order;
}