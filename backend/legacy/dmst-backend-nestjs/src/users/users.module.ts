import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserSetting } from './user-setting.entity';
import { Intake } from '../intakes/intake.entity';
import { UsersService } from './services/users.service';
import { AdminUsersService } from './services/admin-users.service';
import { UserSettingsService } from './services/user-settings.service';
import { UsersController } from './controllers/users.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { UserSettingsController } from './controllers/user-settings.controller';
import { CollaborationsModule } from '../collaborations/collaborations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSetting, Intake]),
    CollaborationsModule,
  ],
  controllers: [UsersController, AdminUsersController, UserSettingsController],
  providers: [UsersService, AdminUsersService, UserSettingsService],
  exports: [UsersService, AdminUsersService, UserSettingsService],
})
export class UsersModule {}
