import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to handle in-app notifications.
 * Notifications are stored in Postgres and displayed in the user's dashboard.
 */
@Injectable()
export class NotificationService {
  /**
   * @param {PrismaService} prisma
   */
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  /**
   * Creates a new notification for a specific user.
   * @param {string} userId - Target user ID.
   * @param {string} title - Brief summary (e.g., "Supplier Approved").
   * @param {string} message - Detailed information.
   * @returns {Promise<Object>} The created notification.
   */
  async create(userId, title, message) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  }

  /**
   * Mass notify all admins or super admins.
   * @param {string} title
   * @param {string} message
   * @param {string[]} roles - Array of roles (e.g., ['ADMIN', 'SUPER_ADMIN']).
   */
  async notifyRoles(title, message, roles = ['ADMIN', 'SUPER_ADMIN']) {
    const users = await this.prisma.user.findMany({
      where: { role: { in: roles } },
      select: { id: true },
    });

    const notifications = users.map((u) => ({
      userId: u.id,
      title,
      message,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }

  /**
   * Clean up old read notifications (optional maintenance task).
   * @param {number} days - Delete notifications older than X days.
   */
  async cleanup(days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - days);

    return this.prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: expiryDate },
      },
    });
  }
}
