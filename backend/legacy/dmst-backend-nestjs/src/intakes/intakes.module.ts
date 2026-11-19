import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import {
  IntakesController,
  SectorsController,
  CategoriesController,
} from './admin-intakes.controller';
import {
  UserIntakesController,
  MyIntakesController,
  UserSectorsController,
  UserCategoriesController,
  MarketplaceController,
} from './user-intakes.controller';
import { IntakesService } from './intakes.service';
import {
  Intake,
  IntakeAttachment,
  IntakeChunk,
  IntakeMatch,
  Sector,
  IntakeSector,
  Category,
} from './index';
import { FileUploadModule } from '../shared/file-upload/file-upload.module';
import { AiModule } from '../ai/ai.module';
import { SearchModule } from '../search/search.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { INTAKES_QUEUE_NAME } from './constants/intakes.constants';
import { IntakesProcessor } from './queue/intakes.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Intake,
      IntakeAttachment,
      IntakeChunk,
      IntakeMatch,
      Sector,
      IntakeSector,
      Category,
    ]),
    BullModule.registerQueue({ name: INTAKES_QUEUE_NAME }),
    FileUploadModule,
    AiModule,
    SearchModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [
    IntakesController,
    SectorsController,
    CategoriesController,
    UserIntakesController,
    MyIntakesController,
    UserSectorsController,
    UserCategoriesController,
    MarketplaceController,
  ],
  providers: [IntakesService, IntakesProcessor],
  exports: [IntakesService, TypeOrmModule],
})
export class IntakesModule {}
