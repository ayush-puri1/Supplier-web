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
  Bind,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { SessionService } from '../auth/session.service';

/**
 * Controller providing the platform's administrative and super-administrative interface.
 * Access is restricted to users with ADMIN or SUPER_ADMIN roles.
 */
@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class AdminController {
  /**
   * @param {AdminService} adminService
   * @param {SessionService} sessionService
   */
  constructor(
    @Inject(AdminService) adminService,
    @Inject(SessionService) sessionService,
  ) {
    this.adminService = adminService;
    this.sessionService = sessionService;
  }

  /**
   * GET /admin/stats
   * Returns high-level counters for the entire system ecosystem.
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  /**
   * GET /admin/suppliers
   * Returns a paginated list of suppliers with optional status filtering.
   */
  @Get('suppliers')
  @ApiOperation({ summary: 'Get all suppliers with optional status filter' })
  @Bind(Query('status'), Query())
  async getSuppliers(status, pagination) {
    return this.adminService.findAllSuppliers(
      status,
      pagination?.skip || 0,
      pagination?.take || 20,
    );
  }

  /**
   * GET /admin/suppliers/pending
   * Shortcut to retrieve all suppliers currently awaiting administrative review.
   */
  @Get('suppliers/pending')
  @ApiOperation({ summary: 'Get pending / under review suppliers' })
  @Bind(Query())
  async getPendingSuppliers(pagination) {
    return this.adminService.getPendingSuppliers(
      pagination?.skip || 0,
      pagination?.take || 20,
    );
  }

  /**
   * GET /admin/suppliers/:id
   * Returns full investigative details for a specific supplier profile.
   */
  @Get('suppliers/:id')
  @Bind(Param('id'))
  async getSupplierById(id) {
    return this.adminService.getSupplierById(id);
  }

  /**
   * PATCH /admin/suppliers/:id/status
   * Transitions a supplier profile through its lifecycle.
   */
  @Patch('suppliers/:id/status')
  @ApiOperation({
    summary: 'Update supplier status with optional rejection reason',
  })
  @Bind(Param('id'), Body(), Request())
  async updateSupplierStatus(id, dto, req) {
    return this.adminService.updateSupplierStatus(
      id,
      dto.status,
      dto.rejectionReason,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * GET /admin/products
   * Returns a listing of all products across all suppliers.
   */
  @Get('products')
  @ApiOperation({ summary: 'Get all products with optional status filter' })
  @Bind(Query('status'), Query())
  async getAllProducts(status, pagination) {
    return this.adminService.getAllProducts(
      status,
      pagination?.skip || 0,
      pagination?.take || 20,
    );
  }

  /**
   * GET /admin/products/:id
   * Returns full product info for verification before approval.
   */
  @Get('products/:id')
  @Bind(Param('id'))
  async getProductById(id) {
    return this.adminService.getProductById(id);
  }

  /**
   * PATCH /admin/products/:id/status
   * Approves or rejects a product for public visibility.
   */
  @Patch('products/:id/status')
  @ApiOperation({
    summary: 'Update product status with optional rejection reason',
  })
  @Bind(Param('id'), Body(), Request())
  async updateProductStatus(id, dto, req) {
    return this.adminService.updateProductStatus(
      id,
      dto.status,
      dto.rejectionReason,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * SUPER ADMIN: GET /admin/users
   * Lists all platform users without exception.
   */
  @Get('users')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: Get all users' })
  @Bind(Query())
  async getAllUsers(pagination) {
    return this.adminService.findAllUsers(
      pagination?.skip || 0,
      pagination?.take || 20,
    );
  }

  /**
   * SUPER ADMIN: POST /admin/users
   * Creates internal administrative accounts.
   */
  @Post('users')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: Create a new admin' })
  @Bind(Body(), Request())
  async createAdmin(dto, req) {
    return this.adminService.createAdmin(
      dto.email,
      dto.password,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * SUPER ADMIN: PATCH /admin/users/:id/role
   * Promotes or demotes user account roles.
   */
  @Patch('users/:id/role')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: Update user role' })
  @Bind(Param('id'), Body(), Request())
  async updateUserRole(id, dto, req) {
    return this.adminService.updateUserRole(
      id,
      dto.role,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * SUPER ADMIN: PATCH /admin/users/:id/active
   * Blocks or restores access for a platform user.
   */
  @Patch('users/:id/active')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: Toggle user active status' })
  @Bind(Param('id'), Body(), Request())
  async toggleUserStatus(id, dto, req) {
    return this.adminService.toggleUserStatus(
      id,
      dto.isActive,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * SUPER ADMIN: POST /admin/users/:id/reset-password
   * Overrides a user's password in case of emergencies or support requests.
   */
  @Post('users/:id/reset-password')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: Force password reset for a user' })
  @Bind(Param('id'), Body(), Request())
  async resetPassword(id, dto, req) {
    return this.adminService.forcePasswordReset(
      id,
      dto.newPassword,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * SUPER ADMIN: PATCH /admin/suppliers/:id/override
   * Manually overrides sensitive supplier metadata.
   */
  @Patch('suppliers/:id/override')
  @Roles('SUPER_ADMIN')
  @Bind(Param('id'), Body())
  async superOverrideSupplier(id, data) {
    return this.adminService.superOverrideSupplier(id, data);
  }

  /**
   * SUPER ADMIN: DELETE /admin/products/:id
   * Hard delete for toxic or erroneous product entries.
   */
  @Delete('products/:id')
  @Roles('SUPER_ADMIN')
  @Bind(Param('id'))
  async deleteProduct(id) {
    return this.adminService.deleteProductPermanently(id);
  }

  /**
   * SUPER ADMIN: PATCH /admin/products/:id/override
   * Forces a product status change without following the normal business logic.
   */
  @Patch('products/:id/override')
  @Roles('SUPER_ADMIN')
  @Bind(Param('id'), Body('status'))
  async superOverrideProductStatus(id, status) {
    return this.adminService.superOverrideProductStatus(id, status);
  }

  /**
   * SUPER ADMIN: GET /admin/config
   * Fetches current global platform settings.
   */
  @Get('config')
  @Roles('SUPER_ADMIN')
  async getConfig() {
    return this.adminService.getSystemConfig();
  }

  /**
   * SUPER ADMIN: PATCH /admin/config
   * Updates global behavior settings for the entire platform.
   */
  @Patch('config')
  @Roles('SUPER_ADMIN')
  @Bind(Body(), Request())
  async updateConfig(dto, req) {
    return this.adminService.updateSystemConfig(dto, req.user.userId);
  }

  /**
   * ADMIN: PATCH /admin/suppliers/:id/notes
   * Updates internal-only auditor notes for a supplier.
   */
  @Patch('suppliers/:id/notes')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Bind(Param('id'), Body('internalNotes'))
  async updateInternalNote(id, internalNotes) {
    return this.adminService.updateInternalNote(id, internalNotes);
  }

  /**
   * GET /admin/sessions
   * Provides visibility into currently logged-in devices across the system.
   */
  @Get('sessions')
  @ApiOperation({ summary: 'Get all active sessions' })
  @Bind(Query())
  async getActiveSessions(pagination) {
    return this.sessionService.getAllSessionsForAdmin(
      pagination?.skip || 0,
      pagination?.take || 20,
    );
  }

  /**
   * ADMIN: PATCH /admin/documents/:id/approve
   * Marks a specific uploaded document as verified.
   */
  @Patch('documents/:id/approve')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Bind(Param('id'), Request())
  async approveDocument(id, req) {
    return this.adminService.approveDocument(
      id,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * ADMIN: PATCH /admin/documents/:id/reject
   * Rejects an uploaded document and requests the supplier to provide a new version.
   */
  @Patch('documents/:id/reject')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Bind(Param('id'), Body(), Request())
  async rejectDocument(id, dto, req) {
    return this.adminService.rejectDocument(
      id,
      dto.reason,
      req.user.userId,
      req.user.email,
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  ADMIN MANAGEMENT ENDPOINTS — SUPER ADMIN ONLY
  // ═══════════════════════════════════════════════════════════

  /**
   * SUPER ADMIN: GET /admin/admins
   * Lists all ADMIN + SUPER_ADMIN users with permissions, last login, and audit action count.
   */
  @Get('admins')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: List all platform administrators' })
  async getAllAdmins() {
    return this.adminService.findAllAdmins();
  }

  /**
   * SUPER ADMIN: PATCH /admin/admins/:id/permissions
   * Grants or revokes granular permission keys for a specific admin.
   */
  @Patch('admins/:id/permissions')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: Update admin permissions' })
  @Bind(Param('id'), Body(), Request())
  async updateAdminPermissions(id, dto, req) {
    return this.adminService.updateAdminPermissions(
      id,
      dto.permissions,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * SUPER ADMIN: POST /admin/admins/invite
   * Creates an admin account and sends an email invitation.
   */
  @Post('admins/invite')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: Invite a new admin by email' })
  @Bind(Body(), Request())
  async inviteAdmin(dto, req) {
    return this.adminService.inviteAdmin(
      dto.email,
      dto.role,
      req.user.userId,
      req.user.email,
    );
  }

  /**
   * SUPER ADMIN: DELETE /admin/admins/:id
   * Permanently removes an admin account. Cannot remove SUPER_ADMIN or self.
   */
  @Delete('admins/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'SUPER ADMIN: Remove an admin account' })
  @Bind(Param('id'), Request())
  async removeAdmin(id, req) {
    return this.adminService.removeAdmin(id, req.user.userId, req.user.email);
  }
}
