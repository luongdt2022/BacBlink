import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { QueryPublicStoryDto } from './dto/story.dto';

@ApiTags('Stories - Public')
@Controller('public/stories')
export class PublicStoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get published stories for landing page (source: user | admin | all)',
  })
  findAll(@Query() query: QueryPublicStoryDto) {
    return this.storiesService.findPublic(query);
  }
}
