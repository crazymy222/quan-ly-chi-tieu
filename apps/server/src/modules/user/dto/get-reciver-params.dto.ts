import { PaginationOptionsDto } from "@/common/dtos/pagination-options.dto";
import { IsOptional, IsString } from "class-validator";

export class GetReciverParamsDto extends PaginationOptionsDto {
  @IsOptional()
  @IsString()
  search: string;
}