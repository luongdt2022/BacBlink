import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../config/redis.config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = configService.getOrThrow<RedisConfig>('redis');
        return {
          connection: { url: redis.url },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
