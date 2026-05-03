import { User } from "@/common/entities/user.entity";
import { GetOneWalletResponseDto } from "@/modules/wallet/dto/get-one-wallet-response.dto";
import { Exclude, Expose, Transform, Type } from "class-transformer";

export class GetReciverResponseDto {
  count: number;

  @Type(() => User)
  items: User[]
}
