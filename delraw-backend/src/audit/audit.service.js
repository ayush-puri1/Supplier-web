import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to handle system audit logging and retrieval.
 * Tracks actions performed by users and admins for transparency and debugging.
 */
@Injectable()
export class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }

    /**
     * Creates a new audit log entry.
     * @param {Object} params - The log parameters.
     * @param {string} params.actorId - ID of the user performing the action.
     * @param {string} [params.actorEmail] - Email of the user.
     * @param {string} params.action - Description of the action (e.g., 'USER_LOGIN').
     * @param {string} [params.entityType] - The type of object affected (e.g., 'Product').
     * @param {string} [params.entityId] - The ID of the object affected.
     * @param {string} [params.details] - Additional human-readable details.
     * @param {any} [params.metadata] - JSON data related to the event.
     * @param {string} [params.ipAddress] - IP address of the requester.
     */
    async log(params) {
        try {
            await this.prisma.auditLog.create({ 
                data: {
                    ...params,
                    entityType: params.entityType || null,
                    entityId: params.entityId || null,
                } 
            });
        } catch (err) {
            console.error('Audit log write failed:', err);
        }
    }

    /**
     * Retrieves audit logs based on filters and pagination.
     * @param {Object} [filters] - Filter criteria for logs.
     */
    async findAll(filters) {
        const take = filters?.take || 20;
        let skip = filters?.skip || 0;

        if (filters?.page) {
            skip = (filters.page - 1) * take;
        }

        const where = {};
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

        const totalPages = Math.ceil(total / take);

        return {
            logs: items,
            total,
            totalPages,
            skip,
            take,
        };
    }

    /**
     * Gets the most recent activity logs.
     * @param {number} limit - Number of logs to return.
     */
    async getRecentActivity(limit = 20) {
        return this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Gets a list of unique actions that have been logged.
     */
    async getDistinctActions() {
        const result = await this.prisma.auditLog.findMany({
            select: { action: true },
            distinct: ['action'],
            orderBy: { action: 'asc' },
        });
        return result.map((r) => r.action);
    }
}
