import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { mailConfig } from './config/mail.config';
import { AiModule } from './ai/ai.module';
import { QueueModule } from './queue/queue.module';
import { RedisConfig } from './config/redis.config';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { IntakesModule } from './intakes/intakes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { MailModule } from './mail/mail.module';
import { HealthController } from './health/health.controller';
import { StatsModule } from './stats/stats.module';
import { CollaborationsModule } from './collaborations/collaborations.module';
import { StoriesModule } from './stories/stories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig, mailConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('database'),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = configService.getOrThrow<RedisConfig>('redis');
        return {
          stores: [new KeyvRedis(redis.url)],
        };
      },
    }),
    SharedModule,
    UsersModule,
    AuthModule,
    IntakesModule,
    NotificationsModule,
    SearchModule,
    MailModule,
    QueueModule,
    AiModule,
    StatsModule,
    CollaborationsModule,
    StoriesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
