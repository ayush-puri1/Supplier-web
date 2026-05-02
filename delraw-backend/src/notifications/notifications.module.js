import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Module responsible for in-app notification creation and delivery.
 * Uses PostgreSQL (Prisma) to store notifications in the Notification table.
 * Exported globally so other modules (Admin, Orders) can inject NotificationsService.
 */
@Module({
  imports: [PrismaModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
