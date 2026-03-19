import { Controller, Post, Body, Get, UseGuards, Request, Param, Patch, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Get('categories')
    @ApiOperation({ summary: 'Get all product categories' })
    async getCategories() {
        return this.productsService.getCategories();
    }

    @Roles(Role.SUPPLIER)
    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload product image to S3' })
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.productsService.uploadImage(file);
    }

    @Roles(Role.SUPPLIER)
    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    async create(@Request() req, @Body() body: CreateProductDto) {
        return this.productsService.create(req.user.userId, body);
    }

    @Roles(Role.SUPPLIER)
    @Get()
    @ApiOperation({ summary: 'Get all products for the current supplier' })
    async findAll(@Request() req, @Query() pagination: PaginationDto) {
        return this.productsService.findAll(req.user.userId, pagination.skip, pagination.take);
    }

    @Roles(Role.SUPPLIER)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Roles(Role.SUPPLIER)
    @Patch(':id')
    @ApiOperation({ summary: 'Update a product' })
    async update(@Request() req, @Param('id') id: string, @Body() body: UpdateProductDto) {
        return this.productsService.update(req.user.userId, id, body);
    }

    @Roles(Role.SUPPLIER)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product (if not live)' })
    async remove(@Request() req, @Param('id') id: string) {
        return this.productsService.remove(req.user.userId, id);
    }

    @Roles(Role.SUPPLIER)
    @Post(':id/images')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Add a new image to the product gallery' })
    async addProductImage(
        @Param('id') productId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('order') order: string,
        @Body('alt') alt: string,
        @Request() req
    ) {
        return this.productsService.addProductImage(productId, file, parseInt(order) || 0, alt, req.user.userId);
    }

    @Roles(Role.SUPPLIER)
    @Delete(':productId/images/:imageId')
    @ApiOperation({ summary: 'Remove an image from the product gallery' })
    async deleteProductImage(
        @Param('productId') productId: string,
        @Param('imageId') imageId: string,
        @Request() req
    ) {
        return this.productsService.removeProductImage(productId, imageId, req.user.userId);
    }
}
