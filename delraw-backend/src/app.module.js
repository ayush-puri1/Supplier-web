import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// ... rest of imports
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { DocumentsModule } from './documents/documents.module';
import { AdminModule } from './admin/admin.module';
import { SupplierModule } from './supplier/supplier.module';
import { APP_GUARD } from '@nestjs/core';
import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';
import { AuditModule } from './audit/audit.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    }),
    AuthModule,
    UsersModule,
    /*
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 100,
      },
    ]),
    */
    ProductsModule,
    DocumentsModule,
    AdminModule,
    SupplierModule,
    StorageModule,
    MailModule,
    AuditModule,
    AnalyticsModule,
    OrdersModule,
    NotificationsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /*
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    */
  ],
})
export class AppModule {}
