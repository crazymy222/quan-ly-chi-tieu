import { GoogleStratergy } from '@/common/stratergies/google.stratergy';
import { RepositoriesModule } from '@/common/repositories/repositories.module';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';

@Module({
  imports: [
    UserModule,
    RepositoriesModule,
    AuthModule,
  ],
  controllers: [OauthController],
  providers: [OauthService, GoogleStratergy],
})
export class OauthModule {}
