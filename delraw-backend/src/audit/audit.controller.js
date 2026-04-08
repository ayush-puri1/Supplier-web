import { Bind, Controller,
    Inject,
    Get,
    Query,
    UseGuards, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { AuditService } from './audit.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for Admin to view and filter system audit logs.
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
     * Returns a paginated list of audit logs with optional filtering.
     */
    @Get()
    @ApiOperation({ summary: 'Get all audit logs with pagination and filters' })
    @Bind(Query('action'), Query('actorId'), Query('entityType'), Query('startDate'), Query('endDate'), Query('page'), Query())
    async findAll(action, actorId, entityType, startDate, endDate, page, pagination) {
        const skip = pagination?.skip || 0;
        const take = pagination?.take || 20;

        return this.auditService.findAll({
            action,
            actorId,
            entityType,
            startDate,
            endDate,
            skip,
            take,
            page: page ? parseInt(page) : undefined,
        });
    }

    /**
     * GET /admin/audit-logs/recent
     * Returns the newest logs.
     */
    @Get('recent')
    @ApiOperation({ summary: 'Get recent activity logs' })
    @Bind(Query('limit'))
    async getRecent(limit) {
        return this.auditService.getRecentActivity(limit ? parseInt(limit) : 20);
    }

    /**
     * GET /admin/audit-logs/actions
     * Returns a list of all unique action types recorded in the system.
     */
    @Get('actions')
    @ApiOperation({ summary: 'Get list of distinct actions logged' })
    async getDistinctActions() {
        return this.auditService.getDistinctActions();
    }
}
