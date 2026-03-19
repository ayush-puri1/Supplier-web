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
import { PaginationDto } from '../common/dto/pagination.dto';

import { AdminService } from './admin.service';
import { SessionService } from '../auth/session.service';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';

import {
    Role,
    SupplierStatus,
    ProductStatus,
} from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
    UpdateSupplierStatusDto,
    UpdateProductStatusDto,
    CreateAdminDto,
    UpdateUserRoleDto,
    UpdateUserActiveDto,
    ForcePasswordResetDto,
} from './dto/admin.dto';
import { UpdateSystemConfigDto } from './dto/update-config.dto';
import { RejectDocumentDto } from './dto/review-document.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly sessionService: SessionService,
    ) { }

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
    @ApiOperation({ summary: 'Get all suppliers with optional status filter' })
    async getSuppliers(
        @Query('status') status: SupplierStatus,
        @Query() pagination: PaginationDto,
    ) {
        return this.adminService.findAllSuppliers(status, pagination.skip, pagination.take);
    }

    // =====================================
    // GET PENDING / UNDER REVIEW SUPPLIERS
    // =====================================
    @Get('suppliers/pending')
    @ApiOperation({ summary: 'Get pending / under review suppliers' })
    async getPendingSuppliers(@Query() pagination: PaginationDto) {
        return this.adminService.getPendingSuppliers(pagination.skip, pagination.take);
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
    @ApiOperation({ summary: 'Update supplier status with optional rejection reason' })
    async updateSupplierStatus(
        @Param('id') id: string,
        @Body() dto: UpdateSupplierStatusDto,
        @Request() req,
    ) {
        return this.adminService.updateSupplierStatus(id, dto.status, dto.rejectionReason, req.user.userId, req.user.email);
    }

    // =====================================
    // GET ALL PRODUCTS
    // =====================================
    @Get('products')
    @ApiOperation({ summary: 'Get all products with optional status filter' })
    async getAllProducts(
        @Query('status') status: ProductStatus,
        @Query() pagination: PaginationDto,
    ) {
        return this.adminService.getAllProducts(status, pagination.skip, pagination.take);
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
    @ApiOperation({ summary: 'Update product status with optional rejection reason' })
    async updateProductStatus(
        @Param('id') id: string,
        @Body() dto: UpdateProductStatusDto,
        @Request() req,
    ) {
        return this.adminService.updateProductStatus(id, dto.status, dto.rejectionReason, req.user.userId, req.user.email);
    }

    // =====================================
    // SUPER ADMIN: USER MANAGEMENT
    // =====================================

    @Get('users')
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'SUPER ADMIN: Get all users' })
    async getAllUsers(@Query() pagination: PaginationDto) {
        return this.adminService.findAllUsers(pagination.skip, pagination.take);
    }

    @Post('users')
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'SUPER ADMIN: Create a new admin' })
    async createAdmin(
        @Body() dto: CreateAdminDto,
        @Request() req,
    ) {
        return this.adminService.createAdmin(dto.email, dto.password, req.user.userId, req.user.email);
    }

    @Patch('users/:id/role')
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'SUPER ADMIN: Update user role' })
    async updateUserRole(
        @Param('id') id: string,
        @Body() dto: UpdateUserRoleDto,
        @Request() req,
    ) {
        return this.adminService.updateUserRole(id, dto.role, req.user.userId, req.user.email);
    }

    @Patch('users/:id/active')
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'SUPER ADMIN: Toggle user active status' })
    async toggleUserStatus(
        @Param('id') id: string,
        @Body() dto: UpdateUserActiveDto,
        @Request() req,
    ) {
        return this.adminService.toggleUserStatus(id, dto.isActive, req.user.userId, req.user.email);
    }

    @Post('users/:id/reset-password')
    @Roles(Role.SUPER_ADMIN)
    @ApiOperation({ summary: 'SUPER ADMIN: Force password reset for a user' })
    async resetPassword(
        @Param('id') id: string,
        @Body() dto: ForcePasswordResetDto,
        @Request() req,
    ) {
        return this.adminService.forcePasswordReset(id, dto.newPassword, req.user.userId, req.user.email);
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
    async updateConfig(@Body() dto: UpdateSystemConfigDto, @Request() req) {
        return this.adminService.updateSystemConfig(dto, req.user.userId);
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

    // =====================================
    // SESSIONS
    // =====================================
    @Get('sessions')
    @ApiOperation({ summary: 'Get all active sessions' })
    async getActiveSessions(@Query() pagination: PaginationDto) {
        return this.sessionService.getAllSessionsForAdmin(pagination.skip, pagination.take);
    }

    // =====================================
    // DOCUMENTS
    // =====================================
    @Patch('documents/:id/approve')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    async approveDocument(@Param('id') id: string, @Request() req) {
        return this.adminService.approveDocument(id, req.user.userId, req.user.email);
    }

    @Patch('documents/:id/reject')
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    async rejectDocument(
        @Param('id') id: string,
        @Body() dto: RejectDocumentDto,
        @Request() req
    ) {
        return this.adminService.rejectDocument(id, dto.reason, req.user.userId, req.user.email);
    }
}