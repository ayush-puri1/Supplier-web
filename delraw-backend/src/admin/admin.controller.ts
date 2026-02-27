import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AdminService } from './admin.service';
import { Roles } from '../auth/roles/roles.decorator';

import {
    Role,
    SupplierStatus,
    ProductStatus,
} from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // =====================================
    // DASHBOARD STATS
    // =====================================
    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    // =====================================
    // GET ALL SUPPLIERS (OPTIONAL FILTER)
    // =====================================
    @Get('suppliers')
    async getSuppliers(
        @Query('status') status?: SupplierStatus,
    ) {
        return this.adminService.findAllSuppliers(status);
    }

    // =====================================
    // GET PENDING / UNDER REVIEW SUPPLIERS
    // =====================================
    @Get('suppliers/pending')
    async getPendingSuppliers() {
        return this.adminService.getPendingSuppliers();
    }

    // =====================================
    // GET SUPPLIER BY ID (DETAILED)
    // =====================================
    @Get('suppliers/:id')
    async getSupplierById(@Param('id') id: string) {
        return this.adminService.getSupplierById(id);
    }

    // =====================================
    // UPDATE SUPPLIER STATUS
    // =====================================
    @Patch('suppliers/:id/status')
    async updateSupplierStatus(
        @Param('id') id: string,
        @Body('status') status: SupplierStatus,
    ) {
        return this.adminService.updateSupplierStatus(id, status);
    }

    // =====================================
    // GET ALL PRODUCTS
    // =====================================
    @Get('products')
    async getAllProducts(
        @Query('status') status?: ProductStatus,
    ) {
        return this.adminService.getAllProducts(status);
    }

    // =====================================
    // UPDATE PRODUCT STATUS
    // =====================================
    @Patch('products/:id/status')
    async updateProductStatus(
        @Param('id') id: string,
        @Body('status') status: ProductStatus,
    ) {
        return this.adminService.updateProductStatus(id, status);
    }
}