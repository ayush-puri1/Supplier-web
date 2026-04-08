import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsService } from '../aws/aws.service';

/**
 * Service to handle product lifecycle management for suppliers.
 * Includes category retrieval, image uploads via S3, and product CRUD.
 * Enforces platform-level limits such as max products per supplier.
 */
@Injectable()
export class ProductsService {
    /**
     * @param {PrismaService} prisma
     * @param {AwsService} awsService
     */
    constructor(
        @Inject(PrismaService) prisma,
        @Inject(AwsService) awsService
    ) {
        this.prisma = prisma;
        this.awsService = awsService;
    }

    /**
     * Predefined list of allowed product categories.
     * Used for validation and frontend dropdowns.
     */
    static get CATEGORIES() {
        return [
            'Raw Materials',
            'Textiles',
            'Chemicals',
            'Electronics',
            'Hardware',
            'Packaging',
            'Machinery',
            'Logistics Services'
        ];
    }

    /**
     * Gets all valid product categories.
     * @returns {Promise<string[]>}
     */
    async getCategories() {
        return ProductsService.CATEGORIES;
    }

    /**
     * Uploads a temporary product image to S3.
     * @param {Object} file - The Multer file object.
     * @returns {Promise<{ url: string }>} The public URL of the uploaded image.
     */
    async uploadImage(file) {
        if (!file) throw new BadRequestException('No file provided');
        const { url } = await this.awsService.uploadFile(file, 'products');
        return { url };
    }

    /**
     * Creates a new product for a supplier.
     * Validates supplier limits and formats data before persisting.
     * @param {string} userId - ID of the creating user.
     * @param {Object} data - Product details and nested variants.
     */
    async create(userId, data) {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) {
            throw new NotFoundException('Supplier profile not found');
        }

        // Enforce system limits on product count per supplier
        const config = await this.prisma.systemConfig.findUnique({
            where: { id: 'singleton' },
        });

        const productCount = await this.prisma.product.count({
            where: { supplierId: supplier.id },
        });

        if (config && productCount >= config.maxProductsPerSupplier) {
            throw new BadRequestException(`Product limit of ${config.maxProductsPerSupplier} reached`);
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
                supplierId: supplier.id,
                status: 'PENDING_APPROVAL',
                variants: {
                    create: Array.isArray(variants) ? variants.map((v) => ({
                        sku: v.sku || null,
                        name: v.name,
                        price: v.price ? parseFloat(v.price) : null,
                        stock: v.stock ? parseInt(v.stock) : 0,
                    })) : [],
                }
            },
            include: { variants: true, images: true },
        });
    }

    /**
     * Lists all products belonging to the calling supplier with pagination.
     */
    async findAll(userId, skip = 0, take = 20) {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) return { items: [], total: 0, skip, take };

        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where: { supplierId: supplier.id },
                orderBy: { createdAt: 'desc' },
                include: { variants: true, images: { orderBy: { order: 'asc' } } },
                skip,
                take,
            }),
            this.prisma.product.count({
                where: { supplierId: supplier.id },
            }),
        ]);

        return { items, total, skip, take };
    }

    /**
     * Retrieves a single product by its unique ID.
     */
    async findOne(id) {
        return this.prisma.product.findUnique({ 
            where: { id }, 
            include: { variants: true, images: { orderBy: { order: 'asc' } } } 
        });
    }

    /**
     * Updates an existing product's basic details.
     * Verifies ownership before allowing modifications.
     */
    async update(userId, id, data) {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.supplierId !== supplier.id) throw new ForbiddenException('Not your product');

        const updateData = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.specs !== undefined) updateData.specs = data.specs;
        if (data.moq !== undefined) updateData.moq = parseInt(data.moq);
        if (data.leadTime !== undefined) updateData.leadTime = parseInt(data.leadTime);
        if (data.price !== undefined) updateData.price = parseFloat(data.price);
        if (data.unit !== undefined) updateData.unit = data.unit;

        return this.prisma.product.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Deletes a product if it is not currently 'LIVE'.
     * Live products must be delisted rather than deleted for data integrity.
     */
    async remove(userId, id) {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) throw new NotFoundException('Supplier not found');

        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');
        if (product.supplierId !== supplier.id) throw new ForbiddenException('Not your product');
        if (product.status === 'LIVE') throw new ForbiddenException('Cannot delete a live product');

        return this.prisma.product.delete({ where: { id } });
    }

    /**
     * Admin-only: Directly updates product status (Approvals/Rejections).
     */
    async updateStatus(id, status, isLive) {
        return this.prisma.product.update({
            where: { id },
            data: { status, isLive },
        });
    }

    /**
     * Adds an image to a product's gallery via S3.
     */
    async addProductImage(productId, file, order, alt, userId) {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) throw new NotFoundException('Supplier profile not found');

        const product = await this.prisma.product.findFirst({
            where: { id: productId, supplierId: supplier.id }
        });
        if (!product) throw new ForbiddenException('Product not found or not yours');

        const { url, key } = await this.awsService.uploadFile(file, `products/${productId}`);

        return this.prisma.productImage.create({
            data: { productId, url, key, order, alt }
        });
    }

    /**
     * Removes an image from a product's gallery and deletes the physical file from S3.
     */
    async removeProductImage(productId, imageId, userId) {
        const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
        if (!supplier) throw new NotFoundException('Supplier profile not found');

        const product = await this.prisma.product.findFirst({ where: { id: productId, supplierId: supplier.id } });
        if (!product) throw new ForbiddenException('Product not found or not yours');

        const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
        if (!image || image.productId !== productId) throw new NotFoundException('Image not found');

        await this.awsService.deleteFile(image.key);

        await this.prisma.productImage.delete({ where: { id: imageId } });
        return { message: 'Image deleted' };
    }
}
