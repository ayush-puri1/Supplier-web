import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  Bind,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';

/**
 * Controller for the global platform search.
 * Returns role-scoped results based on the authenticated user.
 */
@ApiTags('Search')
@Controller('search')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(@Inject(SearchService) searchService) {
    this.searchService = searchService;
  }

  /**
   * GET /search?q=query&limit=5
   * Returns role-scoped search results.
   */
  @Get()
  @ApiOperation({ summary: 'Global platform search (role-scoped)' })
  @Bind(Query(), Request())
  async search(query, req) {
    return this.searchService.search(
      query.q,
      { userId: req.user.userId, role: req.user.role },
      parseInt(query.limit) || 5,
    );
  }
}
