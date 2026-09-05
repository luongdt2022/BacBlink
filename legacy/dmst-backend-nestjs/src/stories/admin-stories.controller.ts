import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { StoriesService } from './stories.service';
import {
  CreateStoryDto,
  QueryStoryDto,
  ToggleVisibilityDto,
  UpdateStoryDto,
} from './dto/story.dto';

@ApiTags('Stories - Admin')
@Controller('admin/stories')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class AdminStoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stories (admin)' })
  findAll(@Query() query: QueryStoryDto) {
    return this.storiesService.findAllAdmin(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get story by id (admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a story (admin)' })
  create(@Body() dto: CreateStoryDto, @CurrentUser() user: User) {
    return this.storiesService.create(dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update any story (admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoryDto,
    @CurrentUser() user: User,
  ) {
    return this.storiesService.update(id, dto, user.id, true);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete any story (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.storiesService.remove(id, user.id, true);
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: 'Toggle story visibility (admin)' })
  toggleVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleVisibilityDto,
  ) {
    return this.storiesService.toggleVisibility(id, dto.isHidden);
  }
}
