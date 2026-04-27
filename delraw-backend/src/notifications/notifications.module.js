import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Global module for system-wide notifications.
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
