import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, ProductsModule, AuditModule, AuthModule],
    providers: [AdminService],
    controllers: [AdminController],
})
export class AdminModule { }
