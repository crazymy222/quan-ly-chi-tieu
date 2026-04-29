import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { OauthService } from "src/modules/oauth/oauth.service";
import { ENV } from "../constants/env.const";
import { IOAuthProfile } from "../types/auth.type";

@Injectable()
export class GoogleStratergy extends PassportStrategy(Strategy, 'google') {
  private logger = new Logger(GoogleStratergy.name);

  constructor(
    configService: ConfigService,
    private oauthService: OauthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>(ENV.GOOGLE_CLIENT_ID),
      clientSecret: configService.getOrThrow<string>(ENV.GOOGLE_CLIENT_SECRET),
      callbackURL: configService.getOrThrow<string>(ENV.GOOGLE_CALLBACK_URL),
      scope: ['email', 'profile'],
    })
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, emails, photos, id, provider } = profile;
    const googleProfile: IOAuthProfile = {
      email: emails[0].value,
      displayName,
      provider,
      providerId: id,
    };

    if (!googleProfile?.email) {
      this.logger.error('Google profile email is required');
      throw new UnauthorizedException();
    }

    try {
      const userMetaData = await this.oauthService.validateGoogleUser(googleProfile);
      done(null, userMetaData);
    } catch (error) {
      done(error);
    }
  }
}