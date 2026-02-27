import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: any): Promise<Product> {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) {
            throw new NotFoundException('Supplier profile not found');
        }

        return this.prisma.product.create({
            data: {
                name: data.name,
                description: data.description || null,
                category: data.category,
                specs: data.specs || {},
                moq: parseInt(data.moq) || 0,
                leadTime: parseInt(data.leadTime) || 0,
                price: data.price ? parseFloat(data.price) : null,
                unit: data.unit || null,
                images: data.images || [],
                supplierId: supplier.id,
                status: ProductStatus.PENDING_APPROVAL,
            },
        });
    }

    async findAll(userId: string): Promise<Product[]> {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) return [];
        return this.prisma.product.findMany({
            where: { supplierId: supplier.id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string): Promise<Product | null> {
        return this.prisma.product.findUnique({ where: { id } });
    }

    async update(userId: string, id: string, data: any): Promise<Product> {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.supplierId !== supplier.id) throw new ForbiddenException('Not your product');

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.specs !== undefined) updateData.specs = data.specs;
        if (data.moq !== undefined) updateData.moq = parseInt(data.moq);
        if (data.leadTime !== undefined) updateData.leadTime = parseInt(data.leadTime);
        if (data.price !== undefined) updateData.price = parseFloat(data.price);
        if (data.unit !== undefined) updateData.unit = data.unit;
        if (data.images !== undefined) updateData.images = data.images;

        return this.prisma.product.update({
            where: { id },
            data: updateData,
        });
    }

    async remove(userId: string, id: string): Promise<Product> {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.supplierId !== supplier.id) throw new ForbiddenException('Not your product');
        if (product.status === ProductStatus.LIVE) throw new ForbiddenException('Cannot delete a live product');

        return this.prisma.product.delete({ where: { id } });
    }

    // Admin use only
    async updateStatus(id: string, status: ProductStatus, isLive: boolean): Promise<Product> {
        return this.prisma.product.update({
            where: { id },
            data: { status, isLive },
        });
    }
}
