import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupplierService {
    constructor(private prisma: PrismaService) { }

    // Get own profile
    async getProfile(userId: string) {
        let supplier = await this.prisma.supplier.findUnique({
            where: { userId },
            include: { user: { select: { email: true, role: true, createdAt: true } } },
        });

        // Auto-create if missing
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
                include: { user: { select: { email: true, role: true, createdAt: true } } },
            });
        }

        return supplier;
    }

    // Update profile (only if DRAFT or REJECTED)
    async updateProfile(userId: string, data: any) {
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

        // Only allow updating specific fields
        const allowedFields = [
            'companyName', 'gstNumber', 'panNumber', 'address', 'city', 'country',
            'yearEstablished', 'workforceSize', 'monthlyCapacity',
            'moq', 'leadTimeDays', 'responseTimeHr',
        ];

        const updateData: any = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        // If status was REJECTED, reset to DRAFT on edit
        if (supplier.status === 'REJECTED') {
            updateData.status = 'DRAFT';
        }

        return this.prisma.supplier.update({
            where: { id: supplier.id },
            data: updateData,
            include: { user: { select: { email: true, role: true, createdAt: true } } },
        });
    }

    // Submit for review
    async submit(userId: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { userId },
        });

        if (!supplier) {
            throw new NotFoundException('Profile not found');
        }

        if (supplier.status !== 'DRAFT') {
            throw new ForbiddenException('Can only submit from DRAFT status');
        }

        return this.prisma.supplier.update({
            where: { id: supplier.id },
            data: {
                status: 'SUBMITTED',
            },
            include: { user: { select: { email: true, role: true, createdAt: true } } },
        });
    }

    // =====================================
    // DASHBOARD & STATS
    // =====================================

    async getDashboardStats(userId: string) {
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
            live: supplier.products.filter(p => p.status === 'LIVE').length,
            pending: supplier.products.filter(p => p.status === 'PENDING_APPROVAL').length,
        };

        const salesStats = {
            totalOrders: supplier.orders.length,
            totalRevenue: supplier.orders.reduce((sum, o) => sum + o.totalAmount, 0),
        };

        const notifications = await (this.prisma as any).notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        // Get commission from system config
        const config = await (this.prisma as any).systemConfig.findUnique({
            where: { id: 'singleton' },
        });

        return {
            productStats,
            salesStats,
            notifications,
            commission: config?.businessCommission || 10,
        };
    }

    // =====================================
    // NOTIFICATIONS
    // =====================================

    async getNotifications(userId: string) {
        return (this.prisma as any).notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markNotificationAsRead(userId: string, id: string) {
        return (this.prisma as any).notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }
}