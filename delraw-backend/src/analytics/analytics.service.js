import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to aggregate platform-wide data for admin dashboards.
 * Provides summaries of users, suppliers, and products to help admins monitor platform health.
 */
@Injectable()
export class AnalyticsService {
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  /**
   * Compiles high-level metrics and distributions for the Admin dashboard.
   * @returns {Promise<Object>} Object containing summary counts and status distributions.
   */
  async getDashboardMetrics() {
    // Quick stats
    const [
      totalSuppliers,
      totalProducts,
      totalUsers,
      activeSuppliers,
      liveProducts,
    ] = await Promise.all([
      this.prisma.supplier.count(),
      this.prisma.product.count(),
      this.prisma.user.count(),
      this.prisma.supplier.count({
        where: { status: { in: ['VERIFIED', 'CONDITIONAL'] } },
      }),
      this.prisma.product.count({ where: { status: 'LIVE' } }),
    ]);

    // Status distributions for charts
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
    }, {});

    const productDistribution = productStatusGroups.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {});

    // Top Suppliers by their total product count
    const topSuppliers = await this.prisma.supplier.findMany({
      take: 5,
      orderBy: {
        products: { _count: 'desc' },
      },
      select: {
        id: true,
        companyName: true,
        status: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return {
      summary: {
        totalSuppliers,
        totalProducts,
        totalUsers,
        activeSuppliers,
        liveProducts,
      },
      distributions: {
        supplier: supplierDistribution,
        product: productDistribution,
      },
      topSuppliers,
    };
  }
}
