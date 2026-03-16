import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    Post,
    Delete,
    Request,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AdminService } from './admin.service';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';

import {
    Role,
    SupplierStatus,
    ProductStatus,
} from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
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
        @Request() req,
    ) {
        return this.adminService.updateSupplierStatus(id, status, req.user.userId, req.user.email);
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
    // GET PRODUCT BY ID (DETAILED)
    // =====================================
    @Get('products/:id')
    async getProductById(@Param('id') id: string) {
        return this.adminService.getProductById(id);
    }

    // =====================================
    // UPDATE PRODUCT STATUS
    // =====================================
    @Patch('products/:id/status')
    async updateProductStatus(
        @Param('id') id: string,
        @Body('status') status: ProductStatus,
        @Request() req,
    ) {
        return this.adminService.updateProductStatus(id, status, req.user.userId, req.user.email);
    }

    // =====================================
    // SUPER ADMIN: USER MANAGEMENT
    // =====================================

    @Get('users')
    @Roles(Role.SUPER_ADMIN)
    async getAllUsers() {
        return this.adminService.findAllUsers();
    }

    @Post('users')
    @Roles(Role.SUPER_ADMIN)
    async createAdmin(
        @Body('email') email: string,
        @Body('password') password: string,
        @Request() req,
    ) {
        return this.adminService.createAdmin(email, password, req.user.userId, req.user.email);
    }

    @Patch('users/:id/role')
    @Roles(Role.SUPER_ADMIN)
    async updateUserRole(
        @Param('id') id: string,
        @Body('role') role: Role,
        @Request() req,
    ) {
        return this.adminService.updateUserRole(id, role, req.user.userId, req.user.email);
    }

    @Patch('users/:id/active')
    @Roles(Role.SUPER_ADMIN)
    async toggleUserStatus(
        @Param('id') id: string,
        @Body('isActive') isActive: boolean,
        @Request() req,
    ) {
        return this.adminService.toggleUserStatus(id, isActive, req.user.userId, req.user.email);
    }

    @Post('users/:id/reset-password')
    @Roles(Role.SUPER_ADMIN)
    async resetPassword(
        @Param('id') id: string,
        @Body('newPassword') newPassword: string,
        @Request() req,
    ) {
        return this.adminService.forcePasswordReset(id, newPassword, req.user.userId, req.user.email);
    }

    // =====================================
    // SUPER ADMIN: SUPPLIER OVERRIDE
    // =====================================

    @Patch('suppliers/:id/override')
    @Roles(Role.SUPER_ADMIN)
    async superOverrideSupplier(
        @Param('id') id: string,
        @Body() data: any,
    ) {
        return this.adminService.superOverrideSupplier(id, data);
    }

    // =====================================
    // SUPER ADMIN: PRODUCT OVERRIDE
    // =====================================

    @Delete('products/:id')
    @Roles(Role.SUPER_ADMIN)
    async deleteProduct(@Param('id') id: string) {
        return this.adminService.deleteProductPermanently(id);
    }

    @Patch('products/:id/override')
    @Roles(Role.SUPER_ADMIN)
    async superOverrideProductStatus(
        @Param('id') id: string,
        @Body('status') status: ProductStatus,
    ) {
        return this.adminService.superOverrideProductStatus(id, status);
    }

    // =====================================
    // SUPER ADMIN: PLATFORM CONFIG
    // =====================================

    @Get('config')
    @Roles(Role.SUPER_ADMIN)
    async getConfig() {
        return this.adminService.getSystemConfig();
    }

    @Patch('config')
    @Roles(Role.SUPER_ADMIN)
    async updateConfig(@Body() data: any) {
        return this.adminService.updateSystemConfig(data);
    }

    // =====================================
    // ADMIN: INTERNAL NOTES
    // =====================================

    @Patch('suppliers/:id/notes')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    async updateInternalNote(
        @Param('id') id: string,
        @Body('internalNotes') internalNotes: string,
    ) {
        return this.adminService.updateInternalNote(id, internalNotes);
    }
}