import {
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to handle supplier-specific business logic, including profile management,
 * onboarding status, and dashboard statistics.
 */
@Injectable()
export class SupplierService {
  /**
   * @param {import('../prisma/prisma.service').PrismaService} prisma
   */
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  /**
   * Retrieves the profile of the current supplier.
   * If no profile exists for the user, one is automatically created in DRAFT status.
   * @param {string} userId - The unique ID of the user.
   * @returns {Promise<Object>} The supplier profile with associated user data and documents.
   */
  async getProfile(userId) {
    let supplier = await this.prisma.supplier.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, role: true, createdAt: true } },
        documents: true,
      },
    });

    // Auto-create profile if missing (useful for legacy users or migrations)
    if (!supplier) {
      supplier = await this.prisma.supplier.create({
        data: {
          userId,
          companyName: 'Pending Setup',
          gstNumber: '',
          panNumber: '',
          address: '',
          city: '',
          country: '',
          yearEstablished: 0,
          workforceSize: 0,
          monthlyCapacity: 0,
          moq: 0,
          leadTimeDays: 0,
          responseTimeHr: 0,
          status: 'DRAFT',
        },
        include: {
          user: { select: { email: true, role: true, createdAt: true } },
          documents: true,
        },
      });
    }

    return supplier;
  }

  /**
   * Updates the supplier's profile information.
   * Updates are only allowed if the current status is DRAFT or REJECTED.
   * @param {string} userId - ID of the user performing the update.
   * @param {Object} data - The updated profile data from the request body.
   */
  async updateProfile(userId, data) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });

    if (!supplier) {
      throw new NotFoundException('Profile not found');
    }

    if (supplier.status !== 'DRAFT' && supplier.status !== 'REJECTED') {
      throw new ForbiddenException(
        'Profile can only be edited in DRAFT or REJECTED status',
      );
    }

    // Whitelist of allowed fields to prevent security tampering
    const allowedFields = [
      'companyName',
      'gstNumber',
      'panNumber',
      'address',
      'city',
      'country',
      'yearEstablished',
      'workforceSize',
      'monthlyCapacity',
      'moq',
      'leadTimeDays',
      'responseTimeHr',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // If a previously rejected profile is edited, reset it to DRAFT
    if (supplier.status === 'REJECTED') {
      updateData.status = 'DRAFT';
    }

    return this.prisma.supplier.update({
      where: { id: supplier.id },
      data: updateData,
      include: {
        user: { select: { email: true, role: true, createdAt: true } },
      },
    });
  }

  /**
   * Submits the supplier profile for administrative review.
   * Checks platform config to determine if auto-approval is enabled.
   * @param {string} userId
   */
  async submit(userId) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });

    if (!supplier) {
      throw new NotFoundException('Profile not found');
    }

    if (supplier.status !== 'DRAFT') {
      throw new ForbiddenException('Can only submit from DRAFT status');
    }

    const config = await this.prisma.systemConfig.findUnique({
      where: { id: 'singleton' },
    });

    const newStatus = config?.supplierAutoApprove ? 'VERIFIED' : 'SUBMITTED';

    return this.prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        status: newStatus,
      },
      include: {
        user: { select: { email: true, role: true, createdAt: true } },
      },
    });
  }

  /**
   * Aggregates stats for the supplier dashboard overview.
   * Provides quick insights into products, sales, and platform configurations.
   * @param {string} userId
   */
  async getDashboardStats(userId) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
      include: {
        products: { select: { status: true } },
        orders: { select: { totalAmount: true, status: true } },
      },
    });

    if (!supplier) throw new NotFoundException('Supplier not found');

    const productStats = {
      total: supplier.products.length,
      live: supplier.products.filter((p) => p.status === 'LIVE').length,
      pending: supplier.products.filter((p) => p.status === 'PENDING_APPROVAL')
        .length,
    };

    const salesStats = {
      totalOrders: supplier.orders.length,
      totalRevenue: supplier.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    };

    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const config = await this.prisma.systemConfig.findUnique({
      where: { id: 'singleton' },
    });

    return {
      productStats,
      salesStats,
      notifications,
      commission: config?.businessCommission || 10,
    };
  }

  /**
   * Retrieves all notifications for the authenticated supplier.
   * @param {string} userId
   */
  async getNotifications(userId) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marks a notification as read for the user.
   * @param {string} userId
   * @param {string} id - Notification record ID.
   */
  async markNotificationAsRead(userId, id) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}
