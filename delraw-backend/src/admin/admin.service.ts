import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
    SupplierStatus,
    ProductStatus,
} from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

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
        return this.findAllSuppliers(SupplierStatus.SUBMITTED);
        // Note: SUBMITTED is the initial state for admin review.
        // If we want both SUBMITTED and UNDER_REVIEW, we can adjust the filter.
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
    // UPDATE SUPPLIER STATUS
    // =====================================
    async updateSupplierStatus(id: string, status: SupplierStatus) {
        const allowed: SupplierStatus[] = [
            SupplierStatus.UNDER_REVIEW,
            SupplierStatus.VERIFIED,
            SupplierStatus.CONDITIONAL,
            SupplierStatus.REJECTED,
            SupplierStatus.SUSPENDED,
        ];

        if (!allowed.includes(status)) {
            throw new BadRequestException('Invalid supplier status transition');
        }

        const supplier = await this.prisma.supplier.findUnique({ where: { id } });
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        return this.prisma.supplier.update({
            where: { id },
            data: { status },
            include: this.supplierInclude,
        });
    }

    // =====================================
    // GET ALL PRODUCTS (OPTIONAL FILTER)
    // =====================================
    async getAllProducts(status?: ProductStatus) {
        return this.prisma.product.findMany({
            where: status ? { status } : {},
            include: {
                supplier: {
                    select: { companyName: true, id: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // =====================================
    // UPDATE PRODUCT STATUS
    // =====================================
    async updateProductStatus(id: string, status: ProductStatus) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // isLive is true only if status is LIVE
        const isLive = status === ProductStatus.LIVE;

        return this.prisma.product.update({
            where: { id },
            data: { status, isLive },
            include: {
                supplier: { select: { companyName: true, id: true } },
            },
        });
    }
}
