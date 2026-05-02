import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Global notification service.
 * Creates in-app notifications in the PostgreSQL Notification table
 * whenever significant platform events occur (approvals, rejections, orders, etc.).
 */
@Injectable()
export class NotificationsService {
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  /**
   * Creates a new notification for a specific user.
   * @param {string} userId - The target user's ID.
   * @param {string} title - Short notification title.
   * @param {string} message - Detailed notification message.
   * @returns {Promise<Object>} The created notification record.
   */
  async create(userId, title, message) {
    return this.prisma.notification.create({
      data: { userId, title, message },
    });
  }

  /**
   * Creates notifications for multiple users at once.
   * Useful for broadcasting system-wide alerts.
   * @param {string[]} userIds - Array of target user IDs.
   * @param {string} title - Short notification title.
   * @param {string} message - Detailed notification message.
   */
  async createForMany(userIds, title, message) {
    const data = userIds.map((userId) => ({ userId, title, message }));
    return this.prisma.notification.createMany({ data });
  }

  /**
   * Retrieves all notifications for a user, ordered newest-first.
   * @param {string} userId
   * @param {number} skip
   * @param {number} take
   */
  async findAllForUser(userId, skip = 0, take = 50) {
    const [items, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, total, unread };
  }

  /**
   * Marks a specific notification as read.
   * @param {string} userId
   * @param {string} notificationId
   */
  async markAsRead(userId, notificationId) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all notifications for a user as read.
   * @param {string} userId
   */
  async markAllAsRead(userId) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  EVENT-SPECIFIC NOTIFICATION HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Notifies a supplier when their profile is approved.
   */
  async notifySupplierApproved(userId, companyName) {
    return this.create(
      userId,
      'Profile Verified ✅',
      `Your company "${companyName}" has been verified. You can now list products on the platform.`,
    );
  }

  /**
   * Notifies a supplier when their profile is rejected.
   */
  async notifySupplierRejected(userId, companyName, reason) {
    return this.create(
      userId,
      'Profile Rejected ❌',
      `Your company "${companyName}" verification was rejected. Reason: ${reason || 'Not specified'}. Please update your profile and re-submit.`,
    );
  }

  /**
   * Notifies a supplier when their product is approved (goes LIVE).
   */
  async notifyProductApproved(userId, productName) {
    return this.create(
      userId,
      'Product Approved 🎉',
      `Your product "${productName}" has been approved and is now live on the marketplace.`,
    );
  }

  /**
   * Notifies a supplier when their product is rejected.
   */
  async notifyProductRejected(userId, productName, reason) {
    return this.create(
      userId,
      'Product Rejected ❌',
      `Your product "${productName}" was rejected. Reason: ${reason || 'Not specified'}.`,
    );
  }

  /**
   * Notifies a supplier about a new incoming order.
   */
  async notifyNewOrder(userId, productName, quantity) {
    return this.create(
      userId,
      'New Order Received 📦',
      `A new order for ${quantity}x "${productName}" has been placed. Please review and process it.`,
    );
  }

  /**
   * Notifies a user about an order status change.
   */
  async notifyOrderStatusChange(userId, orderId, newStatus) {
    return this.create(
      userId,
      `Order ${newStatus} 🔄`,
      `Order #${orderId.substring(0, 8)} status has been updated to ${newStatus}.`,
    );
  }
}
