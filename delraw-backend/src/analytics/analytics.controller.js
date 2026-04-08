import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { AnalyticsService } from './analytics.service';
import { AuditService } from '../audit/audit.service';

/**
 * Controller for providing dashboard data to platform administrators.
 * Restricts access to Admin and Super Admin roles.
 */
@Controller('admin/analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AnalyticsController {
    constructor(
        @Inject(AnalyticsService) analyticsService,
        @Inject(AuditService) auditService
    ) {
        this.analyticsService = analyticsService;
        this.auditService = auditService;
    }

    /**
     * GET /admin/analytics
     * Returns combined metrics and recent activity for the overview dashboard.
     */
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
