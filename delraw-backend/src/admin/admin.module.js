import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

/**
 * Centrailized module for platform oversight.
 * Integrates products, auditing, and authentication mechanisms to provide
 * broad management capabilities to staff.
 */
@Module({
  imports: [PrismaModule, ProductsModule, AuditModule, AuthModule, MailModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
