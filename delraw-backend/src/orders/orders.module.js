import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * Module for managing B2B order lifecycle.
 * Uses PostgreSQL (Prisma) for Order storage.
 * Integrates with AuditModule for action logging and
 * NotificationsModule for supplier alerts.
 */
@Module({
  imports: [PrismaModule, AuditModule, NotificationsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
