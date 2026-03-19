import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupplierStatus, ProductStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) {}

    async getDashboardMetrics() {
        // Quick stats
        const [
            totalSuppliers,
            totalProducts,
            totalUsers,
            activeSuppliers,
            liveProducts
        ] = await Promise.all([
            this.prisma.supplier.count(),
            this.prisma.product.count(),
            this.prisma.user.count(),
            this.prisma.supplier.count({ where: { status: { in: ['VERIFIED', 'CONDITIONAL'] } } }),
            this.prisma.product.count({ where: { status: 'LIVE' } })
        ]);

        // Status distributions
        const supplierStatusGroups = await this.prisma.supplier.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        const productStatusGroups = await this.prisma.product.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        const supplierDistribution = supplierStatusGroups.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        const productDistribution = productStatusGroups.reduce((acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
        }, {} as Record<string, number>);

        // Top Suppliers
        const topSuppliers = await this.prisma.supplier.findMany({
            take: 5,
            orderBy: {
                products: { _count: 'desc' }
            },
            select: {
                id: true,
                companyName: true,
                status: true,
                _count: {
                    select: { products: true }
                }
            }
        });


        return {
            summary: {
                totalSuppliers,
                totalProducts,
                totalUsers,
                activeSuppliers,
                liveProducts
            },
            distributions: {
                supplier: supplierDistribution,
                product: productDistribution,
            },
            topSuppliers,
        };
    }
}
