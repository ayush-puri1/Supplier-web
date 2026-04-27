import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { ProductImage, ProductImageSchema } from './schemas/product_image.schema';

/**
 * Module responsible for orchestrating product-related services and controllers.
 * - Prisma for relational product data (Postgres)
 * - Mongoose for product image metadata (MongoDB: product_images collection)
 * - StorageModule for GridFS binary file handling
 */
@Module({
  imports: [
    PrismaModule,
    StorageModule,
    MongooseModule.forFeature([
      { name: 'ProductImage', schema: ProductImageSchema },
    ]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
