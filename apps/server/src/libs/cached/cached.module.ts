import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ENV } from 'src/common/constants/env.const';
import { PROVIDER } from 'src/common/constants/provider.const';
import { CachedService } from './cached.service';

@Global()
@Module({
  providers: [
    {
      provide: PROVIDER.CACHE_MANAGER,
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.getOrThrow(ENV.REDIS_URL));
      },
      inject: [ConfigService],
    },
    CachedService
  ],
  exports: [CachedService],
})
export class CachedModule { }
