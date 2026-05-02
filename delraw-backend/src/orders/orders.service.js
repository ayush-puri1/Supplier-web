import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Service handling the full order lifecycle for the B2B platform.
 * Orders are stored in PostgreSQL via Prisma.
 * Commission is calculated based on the SystemConfig singleton.
 */
@Injectable()
export class OrdersService {
  constructor(
    @Inject(PrismaService) prisma,
    @Inject(AuditService) audit,
    @Inject(NotificationsService) notifications,
  ) {
    this.prisma = prisma;
    this.audit = audit;
    this.notifications = notifications;
  }

  /**
   * Allowed order status transitions.
   */
  get statusTransitions() {
    return {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };
  }

  /**
   * Creates a new order for a specific product.
   * Validates that the product is LIVE and calculates commission from SystemConfig.
   * @param {{ productId: string, quantity: number }} dto
   * @param {{ userId: string, email: string }} actor - The user placing the order.
   */
  async createOrder(dto, actor) {
    const { productId, quantity } = dto;

    if (!productId || !quantity || quantity < 1) {
      throw new BadRequestException('productId and a positive quantity are required');
    }

    // Find the product and verify it's live
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        supplier: {
          select: { id: true, userId: true, companyName: true },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'LIVE' || !product.isLive) {
      throw new BadRequestException('Orders can only be placed for LIVE products');
    }

    if (!product.price || product.price <= 0) {
      throw new BadRequestException('Product has no valid price set');
    }

    // Check MOQ
    if (product.moq && quantity < product.moq) {
      throw new BadRequestException(
        `Minimum order quantity is ${product.moq} units`,
      );
    }

    // Get commission rate from system config
    const config = await this.prisma.systemConfig.findUnique({
      where: { id: 'singleton' },
    });
    const commissionRate = config?.businessCommission || 10;

    const totalAmount = product.price * quantity;
    const commissionPaid = totalAmount * (commissionRate / 100);

    const order = await this.prisma.order.create({
      data: {
        supplierId: product.supplier.id,
        productId: product.id,
        quantity,
        totalAmount,
        commissionPaid,
        status: 'PENDING',
      },
      include: {
        product: { select: { name: true, price: true } },
        supplier: {
          select: {
            companyName: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    // Notify the supplier about the new order
    await this.notifications.notifyNewOrder(
      product.supplier.userId,
      product.name,
      quantity,
    );

    // Audit log
    await this.audit.log({
      actorId: actor.userId,
      actorEmail: actor.email,
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order.id,
      details: `Order placed: ${quantity}x ${product.name} (₹${totalAmount}). Commission: ₹${commissionPaid.toFixed(2)}.`,
    });

    return order;
  }

  /**
   * Returns orders belonging to the authenticated supplier.
   * @param {string} userId - The supplier's user ID.
   * @param {number} skip
   * @param {number} take
   * @param {string} [status] - Optional status filter.
   */
  async getSupplierOrders(userId, skip = 0, take = 20, status) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');

    const where = { supplierId: supplier.id };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          product: { select: { name: true, category: true, price: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);

    // Aggregate stats for the supplier
    const stats = await this.prisma.order.aggregate({
      where: { supplierId: supplier.id },
      _sum: { totalAmount: true, commissionPaid: true },
      _count: true,
    });

    return {
      items,
      total,
      skip,
      take,
      stats: {
        totalOrders: stats._count,
        totalRevenue: stats._sum.totalAmount || 0,
        totalCommission: stats._sum.commissionPaid || 0,
      },
    };
  }

  /**
   * Updates the status of an order (supplier can move through the fulfillment pipeline).
   * @param {string} orderId
   * @param {string} newStatus
   * @param {{ userId: string, email: string, role: string }} actor
   */
  async updateOrderStatus(orderId, newStatus, actor) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        supplier: {
          select: { userId: true, companyName: true },
        },
        product: { select: { name: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Verify ownership for suppliers
    if (actor.role === 'SUPPLIER') {
      const supplier = await this.prisma.supplier.findUnique({
        where: { userId: actor.userId },
      });
      if (!supplier || supplier.id !== order.supplierId) {
        throw new ForbiddenException('You can only update your own orders');
      }
    }

    const allowed = this.statusTransitions[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition order from ${order.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        product: { select: { name: true, price: true } },
        supplier: {
          select: {
            companyName: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    // Notify the supplier about the status change
    await this.notifications.notifyOrderStatusChange(
      order.supplier.userId,
      orderId,
      newStatus,
    );

    // Audit
    await this.audit.log({
      actorId: actor.userId,
      actorEmail: actor.email,
      action: 'ORDER_STATUS_CHANGE',
      entityType: 'Order',
      entityId: orderId,
      details: `${order.status} → ${newStatus}. Product: ${order.product.name}.`,
    });

    return updated;
  }

  /**
   * ADMIN: Returns all platform orders with optional status filtering.
   * @param {number} skip
   * @param {number} take
   * @param {string} [status]
   */
  async getAllOrders(skip = 0, take = 20, status) {
    const where = status ? { status } : {};

    const [items, total, stats] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          product: { select: { name: true, category: true, price: true } },
          supplier: {
            select: {
              companyName: true,
              user: { select: { email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true, commissionPaid: true },
        _count: true,
      }),
    ]);

    return {
      items,
      total,
      skip,
      take,
      stats: {
        totalOrders: stats._count,
        totalRevenue: stats._sum.totalAmount || 0,
        totalCommission: stats._sum.commissionPaid || 0,
      },
    };
  }

  /**
   * ADMIN: Returns detailed information about a specific order.
   * @param {string} orderId
   */
  async getOrderById(orderId) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          select: { name: true, category: true, price: true, status: true },
        },
        supplier: {
          select: {
            companyName: true,
            city: true,
            user: { select: { email: true } },
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
