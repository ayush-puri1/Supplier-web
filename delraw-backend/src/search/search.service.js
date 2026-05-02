import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Global search service providing role-scoped results.
 * - ADMIN/SUPER_ADMIN: search across all suppliers, products, and users.
 * - SUPPLIER: search only their own products.
 *
 * Uses PostgreSQL (Prisma) for full-text search with case-insensitive
 * "contains" queries against key string fields.
 */
@Injectable()
export class SearchService {
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  /**
   * Performs a role-scoped search across the platform.
   * @param {string} query - The search term.
   * @param {{ userId: string, role: string }} actor - The authenticated user.
   * @param {number} limit - Max results per entity type.
   * @returns {Promise<Object>} Grouped search results.
   */
  async search(query, actor, limit = 5) {
    if (!query || query.trim().length < 2) {
      return { products: [], suppliers: [], users: [] };
    }

    const q = query.trim();

    if (actor.role === 'SUPPLIER') {
      return this._searchAsSupplier(q, actor.userId, limit);
    }

    return this._searchAsAdmin(q, limit);
  }

  /**
   * Supplier-scoped search: only returns the supplier's own products.
   */
  async _searchAsSupplier(query, userId, limit) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });

    const products = supplier
      ? await this.prisma.product.findMany({
          where: {
            supplierId: supplier.id,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            price: true,
          },
          take: limit,
        })
      : [];

    return {
      products,
      suppliers: [],
      users: [],
    };
  }

  /**
   * Admin-scoped search: returns global matches across products, suppliers, and users.
   */
  async _searchAsAdmin(query, limit) {
    const [products, suppliers, users] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          category: true,
          status: true,
          price: true,
          supplier: { select: { companyName: true } },
        },
        take: limit,
      }),
      this.prisma.supplier.findMany({
        where: {
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { gstNumber: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          companyName: true,
          city: true,
          status: true,
          user: { select: { email: true } },
        },
        take: limit,
      }),
      this.prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
        take: limit,
      }),
    ]);

    return { products, suppliers, users };
  }
}
