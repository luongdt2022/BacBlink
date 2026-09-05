import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto, SearchResultDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @ApiOperation({
    summary: 'Semantic solution search (hybrid kNN + BM25)',
  })
  search(@Body() dto: SearchDto): Promise<SearchResultDto> {
    return this.searchService.search(dto);
  }
}
