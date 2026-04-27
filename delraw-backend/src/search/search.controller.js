import { Controller, Get, Query, UseGuards, Request, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SearchController {
  constructor(@Inject(SearchService) searchService) {
    this.searchService = searchService;
  }

  @Get()
  @ApiOperation({ summary: 'Global search' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  async search(@Query('q') q, @Request() req) {
    return this.searchService.search(q, req.user);
  }
}
