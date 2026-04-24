import {
  Bind,
  Controller,
  Inject,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { AuditService } from './audit.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for Admin and Super Admin to view and filter system audit logs.
 * Provides endpoints for oversight of all critical system events.
 */
@ApiTags('Audit')
@Controller('admin/audit-logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class AuditController {
  constructor(@Inject(AuditService) auditService) {
    this.auditService = auditService;
  }

  /**
   * GET /admin/audit-logs
   * Returns a paginated list of audit logs with hierarchical filtering.
   */
  @Get()
  @ApiOperation({ summary: 'Get audit logs with search and pagination' })
  @Bind(Query('search'), Query('page'), Query('limit'), Req())
  async findAll(search, page, limit, req) {
    return this.auditService.findAll(req.user, {
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }
}
