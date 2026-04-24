import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLog, AuditLogSchema } from './audit_log.schema';

/**
 * Module responsible for tracking system-wide activity.
 * Records interactions across the entire platform for security and analysis.
 */
@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
