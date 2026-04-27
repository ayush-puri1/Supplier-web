import {
  Bind,
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';

/**
 * Controller for managing supplier product catalogs and images.
 */
@ApiTags('Products')
@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(@Inject(ProductsService) productsService) {
    this.productsService = productsService;
  }

  /**
   * GET /products/categories
   * Returns a curated list of product categories available on the platform.
   */
  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  /**
   * POST /products/upload-image
   * General image upload to S3 for products. Used for drafting.
   */
  @Roles('SUPPLIER')
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload product image to S3' })
  @Bind(UploadedFile())
  async uploadImage(file) {
    return this.productsService.uploadImage(file);
  }

  /**
   * POST /products
   * Creates a new product record. Initial status is usually PENDING_APPROVAL.
   */
  @Roles('SUPPLIER')
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @Bind(Request(), Body())
  async create(req, body) {
    return this.productsService.create(req.user.userId, body);
  }

  /**
   * GET /products
   * Returns a paginated list of products belonging to the authenticated supplier.
   */
  @Roles('SUPPLIER')
  @Get()
  @ApiOperation({ summary: 'Get all products for the current supplier' })
  @Bind(Request(), Query())
  async findAll(req, pagination) {
    const skip = pagination?.skip || 0;
    const take = pagination?.take || 20;
    return this.productsService.findAll(req.user.userId, skip, take);
  }

  /**
   * GET /products/:id
   * Returns full details for a specific product matching the ID.
   */
  @Roles('SUPPLIER')
  @Get(':id')
  @Bind(Param('id'))
  async findOne(id) {
    return this.productsService.findOne(id);
  }

  /**
   * PATCH /products/:id
   * Allows partial updates to product metadata.
   */
  @Roles('SUPPLIER')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @Bind(Request(), Param('id'), Body())
  async update(req, id, body) {
    return this.productsService.update(req.user.userId, id, body);
  }

  /**
   * DELETE /products/:id
   * Removes the product from the system. Rejects if the product is already LIVE.
   */
  @Roles('SUPPLIER')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (if not live)' })
  @Bind(Request(), Param('id'))
  async remove(req, id) {
    return this.productsService.remove(req.user.userId, id);
  }

  /**
   * POST /products/:id/images
   * Uploads and attaches a new image to the product's image gallery.
   */
  @Roles('SUPPLIER')
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Add a new image to the product gallery' })
  @Bind(Param('id'), UploadedFile(), Body('order'), Body('alt'), Request())
  async addProductImage(productId, file, order, alt, req) {
    return this.productsService.addProductImage(
      productId,
      file,
      parseInt(order) || 0,
      alt,
      req.user.userId,
    );
  }

  /**
   * DELETE /products/:productId/images/:imageId
   * Deletes a gallery image by its ID.
   */
  @Roles('SUPPLIER')
  @Delete(':productId/images/:imageId')
  @ApiOperation({ summary: 'Remove an image from the product gallery' })
  @Bind(Param('productId'), Param('imageId'), Request())
  async deleteProductImage(productId, imageId, req) {
    return this.productsService.removeProductImage(
      productId,
      imageId,
      req.user.userId,
    );
  }
}
