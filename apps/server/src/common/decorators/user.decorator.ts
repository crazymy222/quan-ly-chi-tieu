import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { RequestHandler } from "express";
import { User as UserEntity } from "../entities/user.entity";

export const User = createParamDecorator(
  (data: keyof UserEntity, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestHandler>();
    const user = (request as any).user as UserEntity;
    if (!user) throw new UnauthorizedException();
    return data ? user?.[data] : user;
  }
)