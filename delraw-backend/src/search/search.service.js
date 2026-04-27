import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to handle platform-wide search queries.
 */
@Injectable()
export class SearchService {
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  /**
   * Search across the platform based on the user's role.
   * Admin: Searches all suppliers, products.
   * Supplier: Searches only their own products.
   */
  async search(query, user) {
    if (!query || query.trim().length === 0) {
      return { suppliers: [], products: [] };
    }

    const q = query.trim();
    const isSupplier = user.role === 'SUPPLIER';

    let suppliers = [];
    let products = [];

    if (isSupplier) {
      // Supplier searches only their own products
      const supplierRecord = await this.prisma.supplier.findUnique({
        where: { userId: user.userId },
      });

      if (supplierRecord) {
        products = await this.prisma.product.findMany({
          where: {
            supplierId: supplierRecord.id,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
          select: { id: true, name: true, category: true, status: true },
        });
      }
    } else {
      // Admins and Super Admins search everything
      suppliers = await this.prisma.supplier.findMany({
        where: {
          OR: [
            { companyName: { contains: q, mode: 'insensitive' } },
            { gstNumber: { contains: q, mode: 'insensitive' } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: 5,
        select: { id: true, companyName: true, status: true },
      });

      products = await this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, category: true, status: true },
      });
    }

    return {
      suppliers,
      products,
    };
  }
}
