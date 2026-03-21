import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Service for overseeing the entire platform.
 * Provides capabilities for managing suppliers, products, users, and global system configuration.
 * Restricts sensitive operations to Admin and Super Admin roles.
 */
@Injectable()
export class AdminService {
    /**
     * @param {import('../prisma/prisma.service').PrismaService} prisma
     * @param {import('../audit/audit.service').AuditService} audit
     * @param {import('../mail/mail.service').MailService} mail
     */
    constructor(prisma, audit, mail) {
        this.prisma = prisma;
        this.audit = audit;
        this.mail = mail;
    }

    /**
     * Common include object for supplier queries to ensure consistent data structure.
     */
    get supplierInclude() {
        return {
            user: { select: { email: true, role: true, createdAt: true, isActive: true } },
            _count: { select: { products: true, documents: true } },
        };
    }

    /**
     * Aggregates high-level statistics for the global Admin Dashboard.
     */
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
                where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
            }),
            this.prisma.supplier.count({ where: { status: 'VERIFIED' } }),
            this.prisma.supplier.count({ where: { status: 'REJECTED' } }),
            this.prisma.supplier.count({ where: { status: 'DRAFT' } }),
            this.prisma.supplier.count({ where: { status: 'SUSPENDED' } }),
            this.prisma.product.count(),
            this.prisma.product.count({ where: { status: 'PENDING_APPROVAL' } }),
            this.prisma.product.count({ where: { status: 'LIVE' } }),
            this.prisma.product.count({ where: { status: 'DRAFT' } }),
            this.prisma.product.count({ where: { status: 'REJECTED' } }),
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

    /**
     * Retrieves a list of all suppliers with optional status filtering.
     */
    async findAllSuppliers(status, skip = 0, take = 20) {
        const [items, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where: status ? { status } : {},
                include: this.supplierInclude,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.supplier.count({ where: status ? { status } : {} }),
        ]);
        return { items, total, skip, take };
    }

    /**
     * Specialized query to fetch only suppliers currently waiting for verification.
     */
    async getPendingSuppliers(skip = 0, take = 20) {
        const [items, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
                include: this.supplierInclude,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.supplier.count({
                where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
            }),
        ]);
        return { items, total, skip, take };
    }

    /**
     * Fetches complete details for a supplier, including their products and legal documents.
     */
    async getSupplierById(id) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                ...this.supplierInclude,
                products: true,
                documents: true,
            },
        });

        if (!supplier) throw new NotFoundException('Supplier not found');
        return supplier;
    }

    /**
     * Defines strictly allowed state transitions for supplier onboarding.
     */
    get supplierTransitions() {
        return {
            'SUBMITTED': ['UNDER_REVIEW'],
            'UNDER_REVIEW': ['VERIFIED', 'REJECTED', 'CONDITIONAL'],
            'VERIFIED': ['SUSPENDED'],
            'CONDITIONAL': ['UNDER_REVIEW', 'REJECTED'],
            'REJECTED': ['DRAFT'],
            'SUSPENDED': ['UNDER_REVIEW'],
            'DRAFT': [],
        };
    }

    /**
     * Updates a supplier's status and triggers appropriate email notifications.
     */
    async updateSupplierStatus(id, newStatus, rejectionReason, actorId, actorEmail) {
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
            data: { status: newStatus, rejectionReason },
            include: this.supplierInclude,
        });

        // Notify supplier of the outcome
        if (newStatus === 'VERIFIED') {
            await this.mail.sendSupplierApproved(result.user.email, result.companyName);
        } else if (newStatus === 'REJECTED') {
            await this.mail.sendSupplierRejected(result.user.email, result.companyName, rejectionReason || 'No reason provided');
        }

        // Record the administrative action
        await this.audit.log({
            actorId: actorId || 'system',
            actorEmail,
            action: 'SUPPLIER_STATUS_CHANGE',
            entityType: 'Supplier',
            entityId: id,
            details: `${supplier.status} → ${newStatus}${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        });

        return result;
    }

    /**
     * Provides a global view of all products on the platform.
     */
    async getAllProducts(status, skip = 0, take = 20) {
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where: status ? { status } : {},
                include: {
                    supplier: {
                        select: { companyName: true, id: true, user: { select: { email: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.product.count({ where: status ? { status } : {} }),
        ]);
        return { items, total, skip, take };
    }

    /**
     * Retrieves detailed product information for review.
     */
    async getProductById(id) {
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

    /**
     * Defines the strict workflow for product approvals.
     */
    get productTransitions() {
        return {
            'DRAFT': ['PENDING_APPROVAL'],
            'PENDING_APPROVAL': ['LIVE', 'REJECTED'],
            'LIVE': ['DELISTED'],
            'DELISTED': ['LIVE'],
            'REJECTED': ['PENDING_APPROVAL'],
        };
    }

    /**
     * Updates product status (Approves, Rejects, or Delists).
     */
    async updateProductStatus(id, newStatus, rejectionReason, actorId, actorEmail) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        const allowed = this.productTransitions[product.status] || [];
        if (!allowed.includes(newStatus)) {
            throw new BadRequestException(
                `Cannot transition product from ${product.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
            );
        }

        const isLive = newStatus === 'LIVE';

        const result = await this.prisma.product.update({
            where: { id },
            data: { status: newStatus, isLive, rejectionReason },
            include: {
                supplier: { select: { companyName: true, id: true, user: { select: { email: true } } } },
            },
        });

        // Notify the supplier
        const supplierEmail = result.supplier.user.email;
        if (newStatus === 'LIVE') {
            await this.mail.sendProductApproved(supplierEmail, result.name);
        } else if (newStatus === 'REJECTED') {
            await this.mail.sendProductRejected(supplierEmail, result.name, rejectionReason || 'No reason provided');
        }

        await this.audit.log({
            actorId: actorId || 'system',
            actorEmail,
            action: 'PRODUCT_STATUS_CHANGE',
            entityType: 'Product',
            entityId: id,
            details: `${product.status} → ${newStatus}${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        });

        return result;
    }

    /**
     * SUPER ADMIN: Lists all users including their roles and associations.
     */
    async findAllUsers(skip = 0, take = 20) {
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    supplier: { select: { id: true, companyName: true, status: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.user.count(),
        ]);
        return { items, total, skip, take };
    }

    /**
     * SUPER ADMIN: Instantly creates a new administrator account.
     */
    async createAdmin(email, password, actorId, actorEmail) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) throw new BadRequestException('Email already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'ADMIN',
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

    /**
     * SUPER ADMIN: Changes a user's role (e.g., UPGRADE TO ADMIN).
     */
    async updateUserRole(id, role, actorId, actorEmail) {
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

    /**
     * SUPER ADMIN: Disables or Re-enables user accounts.
     */
    async toggleUserStatus(id, isActive, actorId, actorEmail) {
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

    /**
     * SUPER ADMIN: Changes a user's password directly (Emergency override).
     */
    async forcePasswordReset(id, newPassword, actorId, actorEmail) {
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

    /**
     * SUPER ADMIN: Direct manual override of supplier metadata.
     */
    async superOverrideSupplier(id, data) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        return this.prisma.supplier.update({
            where: { id },
            data,
            include: this.supplierInclude,
        });
    }

    /**
     * SUPER ADMIN: Permanent removal of a product from the database.
     */
    async deleteProductPermanently(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.product.delete({ where: { id } });
    }

    /**
     * SUPER ADMIN: Direct status override (Bypasses state machine).
     */
    async superOverrideProductStatus(id, newStatus) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        const isLive = newStatus === 'LIVE';
        return this.prisma.product.update({
            where: { id },
            data: { status: newStatus, isLive },
            include: {
                supplier: { select: { companyName: true, id: true, user: { select: { email: true } } } },
            },
        });
    }

    /**
     * Retrieves the platform's singleton configuration record.
     */
    async getSystemConfig() {
        let config = await this.prisma.systemConfig.findUnique({
            where: { id: 'singleton' },
        });

        if (!config) {
            config = await this.prisma.systemConfig.create({
                data: { id: 'singleton' },
            });
        }

        return config;
    }

    /**
     * SUPER ADMIN: Updates global platform settings.
     */
    async updateSystemConfig(dto, adminId) {
        const config = await this.getSystemConfig();
        const { id, updatedAt, ...updateData } = dto;

        return this.prisma.systemConfig.update({
            where: { id: config.id },
            data: { ...updateData, updatedBy: adminId },
        });
    }

    /**
     * ADMIN: Approves a specific legal document submitted by a supplier.
     */
    async approveDocument(documentId, adminId, adminEmail) {
        const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!doc) throw new NotFoundException('Document not found');

        const updated = await this.prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'VERIFIED',
                rejectionReason: null,
                reviewedAt: new Date(),
                reviewedBy: adminId,
            }
        });

        await this.audit.log({
            action: 'DOCUMENT_APPROVED',
            actorId: adminId,
            actorEmail: adminEmail,
            entityType: 'Document',
            entityId: documentId,
            details: `Document approved. SupplierId: ${doc.supplierId}`
        });

        return updated;
    }

    /**
     * ADMIN: Rejects a submitted document with a specific reason.
     */
    async rejectDocument(documentId, reason, adminId, adminEmail) {
        const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!doc) throw new NotFoundException('Document not found');

        if (!reason || reason.trim().length < 5) {
            throw new BadRequestException('Rejection reason must be at least 5 characters');
        }

        const updated = await this.prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'REJECTED',
                rejectionReason: reason.trim(),
                reviewedAt: new Date(),
                reviewedBy: adminId,
            }
        });

        await this.audit.log({
            action: 'DOCUMENT_REJECTED',
            actorId: adminId,
            actorEmail: adminEmail,
            entityType: 'Document',
            entityId: documentId,
            details: `Document rejected. Reason: ${reason}. SupplierId: ${doc.supplierId}`
        });

        return updated;
    }

    /**
     * ADMIN: Updates internal, private notes for a supplier profile.
     */
    async updateInternalNote(id, internalNotes) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        return this.prisma.supplier.update({
            where: { id },
            data: { internalNotes },
            include: this.supplierInclude,
        });
    }
}
