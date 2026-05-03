import { IsNotEmpty, IsString } from "class-validator";

export class SetDefaultWalletDto {
  @IsNotEmpty()
  @IsString()
  walletId: string;
}