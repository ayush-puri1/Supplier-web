import { Controller, Post, Body, Get, UseGuards, Request, Param, Patch, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Get('categories')
    async getCategories() {
        return this.productsService.getCategories();
    }

    @Roles(Role.SUPPLIER)
    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.productsService.uploadImage(file);
    }

    @Roles(Role.SUPPLIER)
    @Post()
    async create(@Request() req, @Body() body) {
        return this.productsService.create(req.user.userId, body);
    }

    @Roles(Role.SUPPLIER)
    @Get()
    async findAll(@Request() req) {
        return this.productsService.findAll(req.user.userId);
    }

    @Roles(Role.SUPPLIER)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Roles(Role.SUPPLIER)
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body() body) {
        return this.productsService.update(req.user.userId, id, body);
    }

    @Roles(Role.SUPPLIER)
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string) {
        return this.productsService.remove(req.user.userId, id);
    }
}
