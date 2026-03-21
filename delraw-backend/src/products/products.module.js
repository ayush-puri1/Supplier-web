import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AwsModule } from '../aws/aws.module';

/**
 * Module responsible for orchestrating product-related services and controllers.
 * Links Prisma for DB and AWS for image storage.
 */
@Module({
    imports: [PrismaModule, AwsModule],
    providers: [ProductsService],
    controllers: [ProductsController],
    exports: [ProductsService],
})
export class ProductsModule { }
