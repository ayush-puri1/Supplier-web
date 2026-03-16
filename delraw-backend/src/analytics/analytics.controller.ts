import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuditService } from '../audit/audit.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '@prisma/client';

@Controller('admin/analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AnalyticsController {
    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly auditService: AuditService
    ) {}

    @Get()
    async getDashboard() {
        const [metrics, recentActivity] = await Promise.all([
            this.analyticsService.getDashboardMetrics(),
            this.auditService.getRecentActivity(10),
        ]);

        return {
            ...metrics,
            recentActivity,
        };
    }
}
