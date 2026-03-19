import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { detectDeviceType } from '../common/utils/device.util';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async createSession(params: {
    userId: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
  }) {
    return this.prisma.userSession.create({
      data: {
        userId: params.userId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceType: detectDeviceType(params.userAgent),
        expiresAt: params.expiresAt,
        isActive: true,
      }
    });
  }

  async deactivateAllSessions(userId: string) {
    return this.prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    });
  }

  async getActiveSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllSessionsForAdmin(skip = 0, take = 50) {
    return this.prisma.userSession.findMany({
      where: { isActive: true, expiresAt: { gt: new Date() } },
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip, take
    });
  }
}
