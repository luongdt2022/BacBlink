import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { StoriesService } from './stories.service';
import { CreateStoryDto, QueryStoryDto, UpdateStoryDto } from './dto/story.dto';

@ApiTags('Stories - User')
@Controller('stories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserStoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published stories' })
  findAll(@Query() query: QueryStoryDto) {
    return this.storiesService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user stories' })
  findMine(@CurrentUser() user: User, @Query() query: QueryStoryDto) {
    return this.storiesService.findMine(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get story by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a story' })
  create(@Body() dto: CreateStoryDto, @CurrentUser() user: User) {
    return this.storiesService.create(dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update own story' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoryDto,
    @CurrentUser() user: User,
  ) {
    return this.storiesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own story' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.storiesService.remove(id, user.id);
  }
}
