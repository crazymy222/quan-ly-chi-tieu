import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { IJwtPayload } from "../types/auth.type";

export const JwtPayload = createParamDecorator(
  (data: keyof IJwtPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const jwtPayload = (request as any).jwtPayload as IJwtPayload;
    if (!jwtPayload) throw new UnauthorizedException();
    return data ? jwtPayload?.[data] : jwtPayload;
  }
)