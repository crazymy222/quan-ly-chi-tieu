import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { CachedService } from "src/libs/cached/cached.service";
import { UserService } from "src/modules/user/user.service";
import { AT_COOKIE_NAME, RT_COOKIE_NAME } from "../constants/auth.const";
import { ENV } from "../constants/env.const";
import { redisKey } from "../constants/redis.const";
import { PUBLIC_ROUTE_METADATA_KEY } from "../decorators/public-route.decorator";
import { IJwtPayload } from "../types/auth.type";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cachedService: CachedService,
    private readonly userService: UserService,
    private readonly reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublicRoute) return true;

    (request as any).user = null;
    (request as any).jwtPayload = null;

    try {
      const token = this.extractTokenFromCookie(request) || this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Access token is required');
      }

      const payload = await this.verifyToken(token, response);
      await this.checkTokenBlacklist(payload);

      const user = await this.userService.getUserById(payload.uid);

      (request as any).user = user;
      (request as any).jwtPayload = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        this.clearTokenCookies(response);
        throw new UnauthorizedException('User not found');
      }
      throw new UnauthorizedException('Invalid access token');
    }
    return true;
  }

  private extractTokenFromCookie(req: Request): string | undefined {
    return req.cookies[AT_COOKIE_NAME];
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type?.startsWith('Bearer') ? token : undefined;
  }

  private async verifyToken(token: string, res: Response): Promise<IJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<IJwtPayload>(token, {
        secret: this.configService.getOrThrow(ENV.JWT_ACCESS_TOKEN_SECRET),
      });
      if (!payload?.uid || !payload?.jti) {
        throw new UnauthorizedException('Invalid access token');
      }
      return payload;
    } catch (error) {
      this.clearTokenCookies(res);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie(AT_COOKIE_NAME);
    res.clearCookie(RT_COOKIE_NAME);
  }

  private async checkTokenBlacklist(payload: IJwtPayload): Promise<void> {
    const isInBlacklist = await this.cachedService.get(redisKey.getTokenBlackListKey(payload.uid, payload.jti));
    if (isInBlacklist) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}