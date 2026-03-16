import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

import {
    SupplierStatus,
    ProductStatus,
    Role,
    User,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditService,
    ) { }

    private readonly supplierInclude = {
        user: { select: { email: true, role: true, createdAt: true, isActive: true } },
        _count: { select: { products: true, documents: true } },
    };

    // =====================================
    // DASHBOARD STATS
    // =====================================
    async getStats() {
        const [
            totalSuppliers,
            pendingSuppliers,
            verifiedSuppliers,
            rejectedSuppliers,
            draftSuppliers,
            suspendedSuppliers,
            totalProducts,
            pendingProducts,
            liveProducts,
            draftProducts,
            rejectedProducts,
        ] = await Promise.all([
            this.prisma.supplier.count(),
            this.prisma.supplier.count({
                where: { status: { in: [SupplierStatus.SUBMITTED, SupplierStatus.UNDER_REVIEW] } },
            }),
            this.prisma.supplier.count({ where: { status: SupplierStatus.VERIFIED } }),
            this.prisma.supplier.count({ where: { status: SupplierStatus.REJECTED } }),
            this.prisma.supplier.count({ where: { status: SupplierStatus.DRAFT } }),
            this.prisma.supplier.count({ where: { status: SupplierStatus.SUSPENDED } }),
            this.prisma.product.count(),
            this.prisma.product.count({ where: { status: ProductStatus.PENDING_APPROVAL } }),
            this.prisma.product.count({ where: { status: ProductStatus.LIVE } }),
            this.prisma.product.count({ where: { status: ProductStatus.DRAFT } }),
            this.prisma.product.count({ where: { status: ProductStatus.REJECTED } }),
        ]);

        return {
            suppliers: {
                total: totalSuppliers,
                pending: pendingSuppliers,
                verified: verifiedSuppliers,
                rejected: rejectedSuppliers,
                draft: draftSuppliers,
                suspended: suspendedSuppliers,
            },
            products: {
                total: totalProducts,
                pending: pendingProducts,
                live: liveProducts,
                draft: draftProducts,
                rejected: rejectedProducts,
            },
        };
    }

    // =====================================
    // GET ALL SUPPLIERS (OPTIONAL FILTER)
    // =====================================
    async findAllSuppliers(status?: SupplierStatus) {
        return this.prisma.supplier.findMany({
            where: status ? { status } : {},
            include: this.supplierInclude,
            orderBy: { createdAt: 'desc' },
        });
    }

    // =====================================
    // GET PENDING / UNDER REVIEW SUPPLIERS
    // =====================================
    async getPendingSuppliers() {
        return this.prisma.supplier.findMany({
            where: { status: { in: [SupplierStatus.SUBMITTED, SupplierStatus.UNDER_REVIEW] } },
            include: this.supplierInclude,
            orderBy: { createdAt: 'desc' },
        });
    }

    // =====================================
    // GET SUPPLIER BY ID (DETAILED)
    // =====================================
    async getSupplierById(id: string) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                ...this.supplierInclude,
                products: true,
                documents: true,
            },
        });

        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        return supplier;
    }

    // =====================================
    // UPDATE SUPPLIER STATUS (strict transitions)
    // =====================================
    private readonly supplierTransitions: Record<string, SupplierStatus[]> = {
        [SupplierStatus.SUBMITTED]: [SupplierStatus.UNDER_REVIEW],
        [SupplierStatus.UNDER_REVIEW]: [SupplierStatus.VERIFIED, SupplierStatus.REJECTED, SupplierStatus.CONDITIONAL],
        [SupplierStatus.VERIFIED]: [SupplierStatus.SUSPENDED],
        [SupplierStatus.CONDITIONAL]: [SupplierStatus.UNDER_REVIEW, SupplierStatus.REJECTED],
        [SupplierStatus.REJECTED]: [SupplierStatus.DRAFT],
        [SupplierStatus.SUSPENDED]: [SupplierStatus.UNDER_REVIEW],
        [SupplierStatus.DRAFT]: [],
    };

    async updateSupplierStatus(id: string, newStatus: SupplierStatus, actorId?: string, actorEmail?: string) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        const allowed = this.supplierTransitions[supplier.status] || [];
        if (!allowed.includes(newStatus)) {
            throw new BadRequestException(
                `Cannot transition supplier from ${supplier.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
            );
        }

        const result = await this.prisma.supplier.update({
            where: { id },
            data: { status: newStatus },
            include: this.supplierInclude,
        });

        await this.audit.log({
            actorId: actorId || 'system',
            actorEmail,
            action: 'SUPPLIER_STATUS_CHANGE',
            entityType: 'Supplier',
            entityId: id,
            details: `${supplier.status} → ${newStatus}`,
        });

        return result;
    }

    // =====================================
    // GET ALL PRODUCTS (OPTIONAL FILTER)
    // =====================================
    async getAllProducts(status?: ProductStatus) {
        return this.prisma.product.findMany({
            where: status ? { status } : {},
            include: {
                supplier: {
                    select: {
                        companyName: true,
                        id: true,
                        user: { select: { email: true } }
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // =====================================
    // GET PRODUCT BY ID (DETAILED)
    // =====================================
    async getProductById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                supplier: { select: { companyName: true, id: true, user: { select: { email: true } } } },
                variants: true,
            },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    // =====================================
    // UPDATE PRODUCT STATUS (strict transitions)
    // =====================================
    private readonly productTransitions: Record<string, ProductStatus[]> = {
        [ProductStatus.DRAFT]: [ProductStatus.PENDING_APPROVAL],
        [ProductStatus.PENDING_APPROVAL]: [ProductStatus.LIVE, ProductStatus.REJECTED],
        [ProductStatus.LIVE]: [ProductStatus.DELISTED],
        [ProductStatus.DELISTED]: [ProductStatus.LIVE],
        [ProductStatus.REJECTED]: [ProductStatus.PENDING_APPROVAL],
    };

    async updateProductStatus(id: string, newStatus: ProductStatus, actorId?: string, actorEmail?: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        const allowed = this.productTransitions[product.status] || [];
        if (!allowed.includes(newStatus)) {
            throw new BadRequestException(
                `Cannot transition product from ${product.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
            );
        }

        const isLive = newStatus === ProductStatus.LIVE;

        const result = await this.prisma.product.update({
            where: { id },
            data: { status: newStatus, isLive },
            include: {
                supplier: { select: { companyName: true, id: true, user: { select: { email: true } } } },
            },
        });

        await this.audit.log({
            actorId: actorId || 'system',
            actorEmail,
            action: 'PRODUCT_STATUS_CHANGE',
            entityType: 'Product',
            entityId: id,
            details: `${product.status} → ${newStatus}`,
        });

        return result;
    }

    // =====================================
    // SUPER ADMIN: USER MANAGEMENT
    // =====================================

    async findAllUsers() {
        try {
            return await this.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    supplier: {
                        select: { id: true, companyName: true, status: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            console.error('ERROR in findAllUsers:', error);
            throw error;
        }
    }

    async createAdmin(email: string, password: string, actorId?: string, actorEmail?: string) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) throw new BadRequestException('Email already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: Role.ADMIN,
                isEmailVerified: true,
            },
            select: { id: true, email: true, role: true, isActive: true, createdAt: true },
        });

        await this.audit.log({
            actorId: actorId || 'system',
            actorEmail,
            action: 'ADMIN_CREATED',
            entityType: 'User',
            entityId: user.id,
            details: `Admin account created: ${email}`,
        });

        return user;
    }

    async updateUserRole(id: string, role: Role, actorId?: string, actorEmail?: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const oldRole = user.role;
        const result = await this.prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, role: true },
        });

        await this.audit.log({
            actorId: actorId || 'system',
            actorEmail,
            action: 'USER_ROLE_CHANGE',
            entityType: 'User',
            entityId: id,
            details: `${oldRole} → ${role}`,
        });

        return result;
    }

    async toggleUserStatus(id: string, isActive: boolean, actorId?: string, actorEmail?: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const result = await this.prisma.user.update({
            where: { id },
            data: { isActive },
            select: { id: true, email: true, isActive: true },
        });

        await this.audit.log({
            actorId: actorId || 'system',
            actorEmail,
            action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
            entityType: 'User',
            entityId: id,
            details: `Account ${isActive ? 'activated' : 'suspended'}`,
        });

        return result;
    }

    async forcePasswordReset(id: string, newPassword: string, actorId?: string, actorEmail?: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
            select: { id: true, email: true },
        });

        await this.audit.log({
            actorId: actorId || 'system',
            actorEmail,
            action: 'PASSWORD_FORCE_RESET',
            entityType: 'User',
            entityId: id,
            details: `Password force-reset by admin`,
        });

        return result;
    }

    // =====================================
    // SUPER ADMIN: SUPPLIER OVERRIDE
    // =====================================

    async superOverrideSupplier(id: string, data: {
        status?: SupplierStatus;
        trustScore?: number;
        internalNotes?: string;
    }) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        return this.prisma.supplier.update({
            where: { id },
            data,
            include: this.supplierInclude,
        });
    }

    // =====================================
    // SUPER ADMIN: PRODUCT OVERRIDE
    // =====================================

    async deleteProductPermanently(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.product.delete({ where: { id } });
    }

    async superOverrideProductStatus(id: string, newStatus: ProductStatus) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        const isLive = newStatus === ProductStatus.LIVE;
        return this.prisma.product.update({
            where: { id },
            data: { status: newStatus, isLive },
            include: {
                supplier: { select: { companyName: true, id: true, user: { select: { email: true } } } },
            },
        });
    }

    // =====================================
    // SUPER ADMIN: PLATFORM CONFIG
    // =====================================

    async getSystemConfig() {
        let config = await (this.prisma as any).systemConfig.findUnique({
            where: { id: 'singleton' },
        });

        if (!config) {
            config = await (this.prisma as any).systemConfig.create({
                data: { id: 'singleton' },
            });
        }

        return config;
    }

    async updateSystemConfig(data: any) {
        // Filter out read-only or problematic fields
        const { id, updatedAt, ...updateData } = data;

        return (this.prisma as any).systemConfig.upsert({
            where: { id: 'singleton' },
            update: updateData,
            create: { id: 'singleton', ...updateData },
        });
    }

    // =====================================
    // ADMIN: INTERNAL NOTES
    // =====================================

    async updateInternalNote(id: string, internalNotes: string) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        return this.prisma.supplier.update({
            where: { id },
            data: { internalNotes },
            include: this.supplierInclude,
        });
    }
}
