import { ENV } from '@/common/constants/env.const';
import { PublicRoute } from '@/common/decorators/public-route.decorator';
import { User } from '@/common/entities/user.entity';
import { GoogleOAuthGuard } from '@/common/guards/google-oauth.guard';
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { AT_COOKIE_NAME, AUTH_COOKIE_OPTS, RT_COOKIE_NAME } from '@/common/constants/auth.const';

@Controller('oauth')
export class OauthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) { }

  @PublicRoute()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() { }

  @PublicRoute()
  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const clientOrigin = this.configService.get<string>(ENV.CLIENT_URL, 'http://localhost:3001');
    try {
      const user = req?.user as User;
      if (!user) throw new Error('No user found');

      const { accessToken, refreshToken } = await this.authService.generateTokenPair({ email: user.email, uid: user.id });

      res.cookie(AT_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTS);
      res.cookie(RT_COOKIE_NAME, refreshToken, AUTH_COOKIE_OPTS);
      return res.redirect(clientOrigin);
    } catch (err) {
      return res.redirect(`${clientOrigin}/login?error=true`);
    }
  }
}
