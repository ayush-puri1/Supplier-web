import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [PrismaModule, ProductsModule, AuditModule],
    providers: [AdminService],
    controllers: [AdminController],
})
export class AdminModule { }
