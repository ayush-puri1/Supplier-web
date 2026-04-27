import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

/**
 * Service to manage supplier legal documents.
 * - Document metadata (type, status, supplierId, reviewedBy) lives in PostgreSQL.
 * - Document binaries (PDF, images) are stored in MongoDB GridFS (bucket: 'documents').
 * - The fileUrl in Postgres stores the backend-served path: /files/documents/<gridfs-id>
 * - The fileKey in Postgres stores the GridFS ObjectId for deletion.
 */
@Injectable()
export class DocumentsService {
  /**
   * @param {PrismaService} prisma
   * @param {StorageService} storageService
   */
  constructor(
    @Inject(PrismaService) prisma,
    @Inject(StorageService) storageService,
  ) {
    this.prisma = prisma;
    this.storageService = storageService;
  }

  /**
   * Uploads a supplier document to GridFS and records metadata in Postgres.
   * @param {string} userId - The user's ID (used to look up their supplier profile).
   * @param {Object} file - The Multer file object (memoryStorage).
   * @param {string} type - The human-readable document type (e.g., 'GST Certificate').
   * @returns {Promise<Object>} The Postgres Document record with the GridFS file URL.
   */
  async upload(userId, file, type) {
    if (!file) throw new BadRequestException('No file provided');
    if (!type || !type.trim()) throw new BadRequestException('Document type is required');

    // Resolve supplier from userId
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
    if (!supplier) throw new NotFoundException('Supplier profile not found');

    // Store binary in GridFS
    const { url, key } = await this.storageService.uploadFile(file, 'documents');

    // Record metadata in Postgres
    return this.prisma.document.create({
      data: {
        supplierId: supplier.id,
        type: type.trim(),
        fileUrl: url,
        fileKey: key,
      },
    });
  }

  /**
   * Retrieves all documents for a supplier.
   * @param {string} supplierId
   */
  async findBySupplierId(supplierId) {
    return this.prisma.document.findMany({
      where: { supplierId },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}
