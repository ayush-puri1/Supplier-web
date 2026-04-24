import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './audit_log.schema';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to handle system audit logging and retrieval using MongoDB.
 * Tracks actions performed by users and admins for transparency and debugging.
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectModel('AuditLog') auditLogModel,
    @Inject(PrismaService) prisma
  ) {
    this.auditLogModel = auditLogModel;
    this.prisma = prisma;
  }

  /**
   * Creates a new audit log entry in MongoDB.
   */
  async log(params) {
    try {
      const logId = `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const newLog = new this.auditLogModel({
        ...params,
        logId,
      });
      await newLog.save();

      // If actor is a supplier, also create a notification
      if (params.actorRole === 'SUPPLIER' || params.entityType === 'Supplier') {
        const targetUserId = params.actorId; // Or derive from entityId if needed
        if (targetUserId) {
          await this.prisma.notification.create({
            data: {
              userId: targetUserId,
              title: params.action.replace(/_/g, ' '),
              message: params.details || `Activity recorded: ${params.action}`,
            },
          });
        }
      }
    } catch (err) {
      console.error('Audit log write failed:', err);
    }
  }

  /**
   * Retrieves audit logs based on role-based hierarchy.
   */
  async findAll(user, filters) {
    const { role, id: actorId } = user;
    const { search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    let query = {};
    console.log(`[AuditService] Finding logs for user: ${actorId} (${role}), Filters:`, filters);

    // ROLE HIERARCHY LOGIC
    if (role === 'ADMIN') {
      // Admins see all suppliers AND only their own admin logs
      query = {
        $or: [
          { actorRole: 'SUPPLIER' },
          { actorId: actorId }
        ]
      };
    } else if (role === 'SUPER_ADMIN') {
      // Super Admins see everything
      query = {};
    } else {
      // Suppliers see only their own (though they usually use notifications)
      query = { actorId: actorId };
    }

    // SEARCH LOGIC
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { logId: { $regex: search, $options: 'i' } },
          { actorEmail: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
          { details: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const [items, total] = await Promise.all([
      this.auditLogModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);

    return {
      logs: items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }
}
