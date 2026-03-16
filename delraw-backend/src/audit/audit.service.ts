import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) {}

    async log(params: {
        actorId: string;
        actorEmail?: string;
        action: string;
        entityType: string;
        entityId: string;
        details?: string;
        ipAddress?: string;
    }) {
        try {
            await this.prisma.auditLog.create({ data: params });
        } catch (err) {
            console.error('Audit log write failed:', err);
        }
    }

    async findAll(filters?: {
        action?: string;
        actorId?: string;
        entityType?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 30;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters?.action) where.action = filters.action;
        if (filters?.actorId) where.actorId = filters.actorId;
        if (filters?.entityType) where.entityType = filters.entityType;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters?.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters?.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getRecentActivity(limit = 20) {
        return this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getDistinctActions() {
        const result = await this.prisma.auditLog.findMany({
            select: { action: true },
            distinct: ['action'],
            orderBy: { action: 'asc' },
        });
        return result.map((r) => r.action);
    }
}
