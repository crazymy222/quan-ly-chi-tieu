import { AT_COOKIE_NAME, AUTH_COOKIE_OPTS, RT_COOKIE_NAME } from '@/common/constants/auth.const';
import { JwtPayload } from '@/common/decorators/jwt-payload';
import { PublicRoute } from '@/common/decorators/public-route.decorator';
import { IJwtPayload } from '@/common/types/auth.type';
import type { IUserProfile } from '@/common/types/user.type';
import { Body, ClassSerializerInterceptor, Controller, HttpCode, HttpException, HttpStatus, Post, Req, Res, SerializeOptions, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import MongooseClassSerializerInterceptor from '@/common/interceptors/mongo-class-serializer.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @PublicRoute()
  @UseInterceptors(MongooseClassSerializerInterceptor(LoginResponseDto))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, userProfile } = await this.authService.login(loginDto);

    res.cookie(AT_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTS);
    res.cookie(RT_COOKIE_NAME, refreshToken, AUTH_COOKIE_OPTS);

    return { accessToken, refreshToken, userProfile };
  }

  @PublicRoute()
  @Post('register')
  @UseInterceptors(MongooseClassSerializerInterceptor(LoginResponseDto))
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string, refreshToken: string, userProfile: IUserProfile }> {
    const { accessToken, refreshToken, userProfile } = await this.authService.register(registerDto);

    res.cookie(AT_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTS);
    res.cookie(RT_COOKIE_NAME, refreshToken, AUTH_COOKIE_OPTS);

    return { accessToken, refreshToken, userProfile };
  }

  @PublicRoute()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string, refreshToken: string }> {
    try {
      const rt = req.cookies[RT_COOKIE_NAME] as string | undefined;
      if (!rt) throw new UnauthorizedException('Refresh token is required');
      const tokenPair = await this.authService.refreshTokenPair(rt);

      res.cookie(AT_COOKIE_NAME, tokenPair.accessToken, AUTH_COOKIE_OPTS);
      res.cookie(RT_COOKIE_NAME, tokenPair.refreshToken, AUTH_COOKIE_OPTS);

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
      };
    } catch (error) {
      res.clearCookie(AT_COOKIE_NAME);
      res.clearCookie(RT_COOKIE_NAME);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Refresh token failed');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @JwtPayload() jwtPayload: IJwtPayload
  ): Promise<void> {
    await this.authService.logout(jwtPayload);
    res.clearCookie(AT_COOKIE_NAME);
    res.clearCookie(RT_COOKIE_NAME);
    return;
  }
}
