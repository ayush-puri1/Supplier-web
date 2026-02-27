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
            'companyName', 'gstNumber', 'address', 'city', 'country',
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
}