import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MAIL_QUEUE_NAME } from './constants/mail.constants';
import { MailService } from './mail.service';
import { MailProcessor } from './queue/mail.processor';

@Module({
  imports: [ConfigModule, BullModule.registerQueue({ name: MAIL_QUEUE_NAME })],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
