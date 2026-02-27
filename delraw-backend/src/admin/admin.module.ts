import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [PrismaModule, ProductsModule],
    providers: [AdminService],
    controllers: [AdminController],
})
export class AdminModule { }
