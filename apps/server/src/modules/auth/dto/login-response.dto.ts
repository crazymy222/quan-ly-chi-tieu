import { User } from "@/common/entities/user.entity";
import { Type } from "class-transformer";

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;

  @Type(() => User)
  userProfile: User;
}