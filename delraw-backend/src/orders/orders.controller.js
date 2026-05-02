import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Bind,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

/**
 * Controller for the order management system.
 * Provides endpoints for creating orders, viewing supplier-specific orders,
 * updating order status, and admin-level platform-wide order views.
 */
@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(@Inject(OrdersService) ordersService) {
    this.ordersService = ordersService;
  }

  /**
   * POST /orders
   * Creates a new order for a LIVE product.
   * Body: { productId: string, quantity: number }
   */
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @Bind(Body(), Request())
  async createOrder(dto, req) {
    return this.ordersService.createOrder(dto, {
      userId: req.user.userId,
      email: req.user.email,
    });
  }

  /**
   * GET /orders/my
   * Returns the authenticated supplier's orders (paginated).
   * Query: ?status=PENDING&skip=0&take=20
   */
  @Get('my')
  @Roles('SUPPLIER')
  @ApiOperation({ summary: 'Get own orders (Supplier)' })
  @Bind(Query(), Request())
  async getMyOrders(query, req) {
    return this.ordersService.getSupplierOrders(
      req.user.userId,
      parseInt(query.skip) || 0,
      parseInt(query.take) || 20,
      query.status,
    );
  }

  /**
   * PATCH /orders/:id/status
   * Updates an order's fulfillment status.
   * Body: { status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }
   */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @Bind(Param('id'), Body(), Request())
  async updateStatus(id, dto, req) {
    return this.ordersService.updateOrderStatus(id, dto.status, {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    });
  }

  /**
   * GET /orders/admin/all
   * ADMIN+: Returns all platform orders with optional status filter.
   * Query: ?status=PENDING&skip=0&take=20
   */
  @Get('admin/all')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'ADMIN: Get all platform orders' })
  @Bind(Query())
  async getAllOrders(query) {
    return this.ordersService.getAllOrders(
      parseInt(query.skip) || 0,
      parseInt(query.take) || 20,
      query.status,
    );
  }

  /**
   * GET /orders/admin/:id
   * ADMIN+: Returns detailed information about a specific order.
   */
  @Get('admin/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'ADMIN: Get order details' })
  @Bind(Param('id'))
  async getOrderDetail(id) {
    return this.ordersService.getOrderById(id);
  }
}
