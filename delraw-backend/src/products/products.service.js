import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

/**
 * Service to handle product lifecycle management for suppliers.
 * - Product metadata (name, price, specs, status) lives in PostgreSQL via Prisma.
 * - Product image records live in MongoDB (ProductImage collection).
 * - Product image binaries live in MongoDB GridFS (bucket: 'products').
 * - Enforces platform-level limits such as max products per supplier.
 */
@Injectable()
export class ProductsService {
  /**
   * @param {PrismaService} prisma
   * @param {StorageService} storageService
   * @param {Model} productImageModel - Mongoose model for product_images collection
   */
  constructor(
    @Inject(PrismaService) prisma,
    @Inject(StorageService) storageService,
    @InjectModel('ProductImage') productImageModel,
  ) {
    this.prisma = prisma;
    this.storageService = storageService;
    this.productImageModel = productImageModel;
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
      'Logistics Services',
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
   * Uploads a temporary product image to GridFS.
   * Used for staging images before a product is saved.
   * @param {Object} file - The Multer file object (memoryStorage).
   * @returns {Promise<{ url: string }>} The backend-served URL of the uploaded image.
   */
  async uploadImage(file) {
    if (!file) throw new BadRequestException('No file provided');
    const { url } = await this.storageService.uploadFile(file, 'products');
    return { url };
  }

  /**
   * Creates a new product for a supplier.
   * Validates supplier limits and formats data before persisting.
   * @param {string} userId - ID of the creating user.
   * @param {Object} data - Product details and nested variants.
   */
  async create(userId, data) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
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
      throw new BadRequestException(
        `Product limit of ${config.maxProductsPerSupplier} reached`,
      );
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
          create: Array.isArray(variants)
            ? variants.map((v) => ({
                sku: v.sku || null,
                name: v.name,
                price: v.price ? parseFloat(v.price) : null,
                stock: v.stock ? parseInt(v.stock) : 0,
              }))
            : [],
        },
      },
      include: { variants: true },
    });
  }

  /**
   * Lists all products belonging to the calling supplier with pagination.
   * Images are fetched from MongoDB and merged into the response.
   */
  async findAll(userId, skip = 0, take = 20) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
    if (!supplier) return { items: [], total: 0, skip, take };

    const [products, total] = await Promise.all([
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

    // Attach MongoDB images to each product
    const items = await Promise.all(
      products.map(async (product) => {
        const images = await this.productImageModel
          .find({ productId: product.id })
          .sort({ order: 1 })
          .lean();
        return { ...product, images };
      }),
    );

    return { items, total, skip, take };
  }

  /**
   * Retrieves a single product by its unique ID, with MongoDB images.
   */
  async findOne(id) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!product) return null;

    const images = await this.productImageModel
      .find({ productId: id })
      .sort({ order: 1 })
      .lean();

    return { ...product, images };
  }

  /**
   * Updates an existing product's basic details.
   * Verifies ownership before allowing modifications.
   */
  async update(userId, id, data) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.supplierId !== supplier.id)
      throw new ForbiddenException('Not your product');

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.specs !== undefined) updateData.specs = data.specs;
    if (data.moq !== undefined) updateData.moq = parseInt(data.moq);
    if (data.leadTime !== undefined)
      updateData.leadTime = parseInt(data.leadTime);
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.unit !== undefined) updateData.unit = data.unit;

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deletes a product if it is not currently 'LIVE'.
   * Also removes all associated images from MongoDB and GridFS.
   * Live products must be delisted rather than deleted for data integrity.
   */
  async remove(userId, id) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.supplierId !== supplier.id)
      throw new ForbiddenException('Not your product');
    if (product.status === 'LIVE')
      throw new ForbiddenException('Cannot delete a live product');

    // Remove all images from GridFS + MongoDB
    const images = await this.productImageModel.find({ productId: id }).lean();
    await Promise.all(
      images.map((img) => this.storageService.deleteFile(img.key, 'products')),
    );
    await this.productImageModel.deleteMany({ productId: id });

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
   * Adds an image to a product's gallery via GridFS.
   * Stores image metadata in MongoDB (product_images collection).
   */
  async addProductImage(productId, file, order, alt, userId) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');

    const product = await this.prisma.product.findFirst({
      where: { id: productId, supplierId: supplier.id },
    });
    if (!product)
      throw new ForbiddenException('Product not found or not yours');

    const { url, key } = await this.storageService.uploadFile(
      file,
      'products',
    );

    const image = await this.productImageModel.create({
      productId,
      url,
      key,
      order: order || 0,
      alt: alt || null,
    });

    return image;
  }

  /**
   * Removes an image from a product's gallery.
   * Deletes both the MongoDB metadata record and the GridFS binary.
   */
  async removeProductImage(productId, imageId, userId) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');

    const product = await this.prisma.product.findFirst({
      where: { id: productId, supplierId: supplier.id },
    });
    if (!product)
      throw new ForbiddenException('Product not found or not yours');

    const image = await this.productImageModel.findById(imageId).lean();
    if (!image || image.productId !== productId)
      throw new NotFoundException('Image not found');

    // Delete binary from GridFS
    await this.storageService.deleteFile(image.key, 'products');
    // Delete metadata from MongoDB
    await this.productImageModel.findByIdAndDelete(imageId);

    return { message: 'Image deleted' };
  }
}
