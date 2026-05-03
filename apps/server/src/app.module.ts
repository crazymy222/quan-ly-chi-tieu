import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './common/guards/auth.guard';
import { CachedModule } from './libs/cached/cached.module';
import { MongoModule } from './libs/databases/mongo/mongo.module';
import { AuthModule } from './modules/auth/auth.module';
import { OauthModule } from './modules/oauth/oauth.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongoModule,
    UserModule,
    AuthModule,
    JwtModule.register({ global: true }),
    CachedModule,
    WalletModule,
    TransactionModule,
    OauthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }
