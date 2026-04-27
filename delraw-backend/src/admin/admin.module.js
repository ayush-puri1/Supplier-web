import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { AuditLog, AuditLogSchema } from '../audit/audit_log.schema';

/**
 * Centralized module for platform oversight.
 * Integrates products, auditing, and authentication mechanisms.
 * Mongoose AuditLog is registered here so AdminService can count
 * admin actions directly from MongoDB.
 */
@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    AuditModule,
    AuthModule,
    MailModule,
    MongooseModule.forFeature([{ name: 'AuditLog', schema: AuditLogSchema }]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
