import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

/**
 * Module for aggregating platform statistics.
 * Links together stats gathering and audit history to provide a complete picture of app usage.
 */
@Module({
    imports: [PrismaModule, AuditModule],
    providers: [AnalyticsService],
    controllers: [AnalyticsController],
})
export class AnalyticsModule {}
