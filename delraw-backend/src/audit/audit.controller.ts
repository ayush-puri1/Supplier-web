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

@Controller('admin/audit-logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @Get()
    async findAll(
        @Query('action') action?: string,
        @Query('actorId') actorId?: string,
        @Query('entityType') entityType?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.auditService.findAll({
            action,
            actorId,
            entityType,
            startDate,
            endDate,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 30,
        });
    }

    @Get('recent')
    async getRecent(@Query('limit') limit?: string) {
        return this.auditService.getRecentActivity(limit ? parseInt(limit) : 20);
    }

    @Get('actions')
    async getDistinctActions() {
        return this.auditService.getDistinctActions();
    }
}
