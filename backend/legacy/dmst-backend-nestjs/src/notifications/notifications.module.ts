import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import { UserNotificationsController } from './user-notifications.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { Intake } from '../intakes/intake.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Intake])],
  controllers: [UserNotificationsController, AdminNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
