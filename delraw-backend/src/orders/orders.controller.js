import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controller for managing orders.
 * Handles different access levels for Suppliers, Admins, and Super Admins.
 */
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * For testing/internal use: Create a manual order.
   * In production, this would be triggered by a customer purchase.
   */
  @Post()
  @Roles('SUPPLIER', 'ADMIN', 'SUPER_ADMIN')
  async create(@Body() data) {
    return this.ordersService.createOrder(data);
  }

  /**
   * Supplier view: Get my orders.
   */
  @Get('my')
  @Roles('SUPPLIER')
  async getMyOrders(
    @Req() req,
    @Query('skip') skip,
    @Query('take') take,
  ) {
    // Find supplierId from req.user (already linked in seed)
    const supplier = await this.ordersService.prisma.supplier.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });
    
    if (!supplier) return { items: [], total: 0 };
    
    return this.ordersService.getSupplierOrders(
      supplier.id,
      parseInt(skip) || 0,
      parseInt(take) || 20,
    );
  }

  /**
   * Supplier action: Update status of an order.
   */
  @Patch(':id/status')
  @Roles('SUPPLIER')
  async updateStatus(
    @Param('id') id,
    @Req() req,
    @Body('status') status,
  ) {
    const supplier = await this.ordersService.prisma.supplier.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });
    
    return this.ordersService.updateOrderStatus(id, supplier.id, status);
  }

  /**
   * Admin view: Global orders.
   */
  @Get('admin/all')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAll(
    @Query('skip') skip,
    @Query('take') take,
  ) {
    return this.ordersService.getAllOrders(
      parseInt(skip) || 0,
      parseInt(take) || 20,
    );
  }

  /**
   * Admin view: Single order detail.
   */
  @Get('admin/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getOne(@Param('id') id) {
    return this.ordersService.getOrderById(id);
  }
}
