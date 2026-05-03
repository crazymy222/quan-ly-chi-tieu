import { PaginationOptionsDto } from "@/common/dtos/pagination-options.dto";
import { IsMongoId, IsString, IsNotEmpty, IsOptional } from "class-validator";

export class GetAllWalletParamsDto extends PaginationOptionsDto { 
  @IsOptional()
  @IsString()
  priorityId?: string;
}