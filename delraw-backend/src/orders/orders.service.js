import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

/**
 * Service to manage the lifecycle of orders.
 * Handles creation, status tracking, and reporting for both suppliers and admins.
 */
@Injectable()
export class OrdersService {
  /**
   * @param {PrismaService} prisma
   * @param {NotificationService} notifications
   * @param {AuditService} audit
   */
  constructor(
    @Inject(PrismaService) prisma,
    @Inject(NotificationService) notifications,
    @Inject(AuditService) audit,
  ) {
    this.prisma = prisma;
    this.notifications = notifications;
    this.audit = audit;
  }

  /**
   * Creates a new order.
   * This would typically be called by a Buyer service (to be implemented).
   */
  async createOrder(data) {
    const { productId, quantity } = data;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { supplier: true },
    });

    if (!product || !product.isLive) {
      throw new BadRequestException('Product not found or not live');
    }

    const totalAmount = (product.price || 0) * quantity;
    
    // Get platform commission from config
    const config = await this.prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    const commissionPercent = config?.businessCommission || 10;
    const commissionPaid = (totalAmount * commissionPercent) / 100;

    const order = await this.prisma.order.create({
      data: {
        productId,
        supplierId: product.supplierId,
        quantity,
        totalAmount,
        commissionPaid,
        status: 'PENDING',
      },
      include: {
        product: { select: { name: true, price: true } },
        supplier: { select: { companyName: true, userId: true } },
      },
    });

    // Notify supplier of new order
    await this.notifications.create(
      order.supplier.userId,
      'New Order Received',
      `You have a new order for ${quantity}x ${order.product.name}. Total: ₹${totalAmount}`,
    );

    await this.audit.log({
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order.id,
      details: `New order for ${product.name} (Qty: ${quantity})`,
    });

    return order;
  }

  /**
   * Retrieves all orders for a specific supplier.
   */
  async getSupplierOrders(supplierId, skip = 0, take = 20) {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { supplierId },
        include: {
          product: { select: { name: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where: { supplierId } }),
    ]);

    return { items, total, skip, take };
  }

  /**
   * Updates an order status (e.g., PENDING -> PROCESSING -> SHIPPED).
   */
  async updateOrderStatus(id, supplierId, status) {
    const order = await this.prisma.order.findFirst({
      where: { id, supplierId },
      include: { product: { select: { name: true } } },
    });

    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
    });

    await this.audit.log({
      action: 'ORDER_STATUS_CHANGE',
      actorId: supplierId,
      entityType: 'Order',
      entityId: id,
      details: `Status changed to ${status} for product ${order.product.name}`,
    });

    return updated;
  }

  /**
   * Admin view: List all orders on the platform.
   */
  async getAllOrders(skip = 0, take = 20) {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        include: {
          product: { select: { name: true } },
          supplier: { select: { companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count(),
    ]);

    return { items, total, skip, take };
  }

  /**
   * Admin view: Get single order details.
   */
  async getOrderById(id) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        supplier: { include: { user: { select: { email: true } } } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
