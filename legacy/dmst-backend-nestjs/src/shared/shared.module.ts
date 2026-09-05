import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { FileUploadModule } from './file-upload/file-upload.module';
import { LoggerService } from './logger/logger.service';

@Global()
@Module({
  imports: [FileUploadModule],
  providers: [RedisService, LoggerService],
  exports: [RedisService, FileUploadModule, LoggerService],
})
export class SharedModule {}
