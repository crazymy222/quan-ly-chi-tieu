import { Type } from "class-transformer";
import { GetOneWalletResponseDto } from "./get-one-wallet-response.dto";

export class GetManyWalletResponseDto {
  count: number;

  @Type(() => GetOneWalletResponseDto)
  items: GetOneWalletResponseDto[];
}
