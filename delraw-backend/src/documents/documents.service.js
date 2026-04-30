import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

/**
 * Service to manage supplier document records in the database.
 * Handles the actual file storage via MongoDB GridFS (StorageService).
 */
@Injectable()
export class DocumentsService {
  /**
   * @param {PrismaService} prisma
   * @param {StorageService} storageService
   */
  constructor(@Inject(PrismaService) prisma, @Inject(StorageService) storageService) {
    this.prisma = prisma;
    this.storageService = storageService;
  }

  /**
   * Records a document upload in the database with a reference URL.
   * @param {string} supplierId - ID of the supplier who owns the document.
   * @param {Object} file - The file metadata from Multer.
   * @param {string} type - The human-readable document type.
   * @returns {Promise<Object>} The database record of the uploaded document.
   */
  async upload(supplierId, file, type) {
    const fileId = await this.storageService.uploadFile(file, 'documents');
    const fileUrl = `/files/documents/${fileId}`;

    return this.prisma.document.create({
      data: {
        supplierId,
        type,
        fileUrl,
      },
    });
  }
}
