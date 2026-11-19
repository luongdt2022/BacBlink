import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaborationRequest } from './collaboration-request.entity';
import { CollaborationsService } from './collaborations.service';
import {
  AdminCollaborationRequestsController,
  MyCollaborationRequestsController,
} from './collaborations.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';
import { Intake } from '../intakes/intake.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollaborationRequest, Intake, User]),
    NotificationsModule,
    MailModule,
  ],
  controllers: [
    MyCollaborationRequestsController,
    AdminCollaborationRequestsController,
  ],
  providers: [CollaborationsService],
  exports: [CollaborationsService],
})
export class CollaborationsModule {}
