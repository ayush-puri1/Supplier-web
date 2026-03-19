import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit')
@Controller('admin/audit-logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @Get()
    @ApiOperation({ summary: 'Get all audit logs with pagination and filters' })
    async findAll(
        @Query('action') action?: string,
        @Query('actorId') actorId?: string,
        @Query('entityType') entityType?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: string,
        @Query() pagination?: PaginationDto,
    ) {
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

    @Get('recent')
    @ApiOperation({ summary: 'Get recent activity logs' })
    async getRecent(@Query('limit') limit?: string) {
        return this.auditService.getRecentActivity(limit ? parseInt(limit) : 20);
    }

    @Get('actions')
    @ApiOperation({ summary: 'Get list of distinct actions logged' })
    async getDistinctActions() {
        return this.auditService.getDistinctActions();
    }
}
