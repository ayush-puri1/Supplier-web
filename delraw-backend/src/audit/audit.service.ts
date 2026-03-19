import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) {}

    async log(params: {
        actorId: string;
        actorEmail?: string;
        action: string;
        entityType?: string;
        entityId?: string;
        details?: string;
        metadata?: any;
        ipAddress?: string;
    }) {
        try {
            await this.prisma.auditLog.create({ 
                data: {
                    ...params,
                    entityType: params.entityType || null,
                    entityId: params.entityId || null,
                } as any 
            });
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
        skip?: number;
        take?: number;
    }) {
        const skip = filters?.skip || 0;
        const take = filters?.take || 20;

        const where: any = {};
        if (filters?.action) where.action = filters.action;
        if (filters?.actorId) where.actorId = filters.actorId;
        if (filters?.entityType) where.entityType = filters.entityType;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters?.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters?.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            items,
            total,
            skip,
            take,
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
