import { Injectable, Inject } from '@nestjs/common';
import { detectDeviceType } from '../common/utils/device.util';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to manage active user sessions across multiple devices.
 * Helps in identifying device types and handling global logouts.
 */
@Injectable()
export class SessionService {
  /**
   * @param {PrismaService} prisma
   */
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  /**
   * Records a new login session.
   */
  async createSession(params) {
    return this.prisma.userSession.create({
      data: {
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceType: detectDeviceType(params.userAgent),
        expiresAt: params.expiresAt,
        isActive: true,
      },
    });
  }

  /**
   * Deactivates all existing sessions for a user (Triggered by password reset or logout).
   */
  async deactivateAllSessions(userId) {
    return this.prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }

  /**
   * Fetches all current, valid sessions for the user.
   */
  async getActiveSessions(userId) {
    return this.prisma.userSession.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * ADMIN ONLY: Provides visibility into platform-wide active sessions.
   */
  async getAllSessionsForAdmin(skip = 0, take = 50) {
    return this.prisma.userSession.findMany({
      where: { isActive: true, expiresAt: { gt: new Date() } },
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }
}
