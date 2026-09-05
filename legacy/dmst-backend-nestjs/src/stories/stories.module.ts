import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from './story.entity';
import { StoriesService } from './stories.service';
import { UserStoriesController } from './user-stories.controller';
import { AdminStoriesController } from './admin-stories.controller';
import { PublicStoriesController } from './public-stories.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Story]), UsersModule],
  controllers: [
    UserStoriesController,
    AdminStoriesController,
    PublicStoriesController,
  ],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
