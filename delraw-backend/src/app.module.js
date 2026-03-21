import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { DocumentsModule } from './documents/documents.module';
import { AdminModule } from './admin/admin.module';
import { SupplierModule } from './supplier/supplier.module';
import { APP_GUARD } from '@nestjs/core';
import { AwsModule } from './aws/aws.module';
import { MailModule } from './mail/mail.module';
import { AuditModule } from './audit/audit.module';
import { AnalyticsModule } from './analytics/analytics.module';

/**
 * Root module of the Delraw backend application.
 * Orchestrates all feature modules and global configuration providers.
 * All core platform features like Auth, Products, and Admin are integrated here.
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 5,
    }]),
    ProductsModule,
    DocumentsModule,
    AdminModule,
    SupplierModule,
    AwsModule,
    MailModule,
    AuditModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
