import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, ProductStatus } from '@prisma/client';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private awsService: AwsService,
    ) { }

    private static readonly CATEGORIES = [
        'Raw Materials',
        'Textiles',
        'Chemicals',
        'Electronics',
        'Hardware',
        'Packaging',
        'Machinery',
        'Logistics Services'
    ];

    async getCategories(): Promise<string[]> {
        return ProductsService.CATEGORIES;
    }

    async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
        if (!file) throw new BadRequestException('No file provided');
        const url = await this.awsService.uploadFile(file, 'products');
        return { url };
    }

    async create(userId: string, data: any): Promise<Product> {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) {
            throw new NotFoundException('Supplier profile not found');
        }

        // Validate category if provided
        if (data.category && !ProductsService.CATEGORIES.includes(data.category)) {
            // Optional: throw error or just allow it. For now, let's just log or be flexible but keep it in mind.
        }

        const { variants, ...restData } = data;

        return this.prisma.product.create({
            data: {
                name: restData.name,
                description: restData.description || null,
                category: restData.category,
                specs: restData.specs || {},
                moq: parseInt(restData.moq) || 0,
                leadTime: parseInt(restData.leadTime) || 0,
                price: restData.price ? parseFloat(restData.price) : null,
                unit: restData.unit || null,
                images: restData.images || [],
                supplierId: supplier.id,
                status: ProductStatus.PENDING_APPROVAL,
                variants: {
                    create: Array.isArray(variants) ? variants.map((v: any) => ({
                        sku: v.sku || null,
                        name: v.name,
                        price: v.price ? parseFloat(v.price) : null,
                        stock: v.stock ? parseInt(v.stock) : 0,
                    })) : [],
                }
            },
            include: { variants: true },
        });
    }

    async findAll(userId: string, skip = 0, take = 20): Promise<{ items: Product[], total: number, skip: number, take: number }> {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) return { items: [], total: 0, skip, take };

        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where: { supplierId: supplier.id },
                orderBy: { createdAt: 'desc' },
                include: { variants: true },
                skip,
                take,
            }),
            this.prisma.product.count({
                where: { supplierId: supplier.id },
            }),
        ]);

        return { items, total, skip, take };
    }

    async findOne(id: string): Promise<Product | null> {
        return this.prisma.product.findUnique({ where: { id }, include: { variants: true } });
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
