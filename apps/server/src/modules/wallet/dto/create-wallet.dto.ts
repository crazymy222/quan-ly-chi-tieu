import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateWalletDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? null)
  accountNumber: string | null;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Số dư phải lớn hơn 0' })
  balance: number;
}
