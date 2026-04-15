import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to manage supplier document records in the database.
 * Does NOT handle the actual file storage (see AwsService).
 */
@Injectable()
export class DocumentsService {
  /**
   * @param {PrismaService} prisma
   */
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  /**
   * Records a document upload in the database with a reference URL.
   * @param {string} supplierId - ID of the supplier who owns the document.
   * @param {Object} file - The file metadata from Multer.
   * @param {string} type - The human-readable document type.
   * @returns {Promise<Object>} The database record of the uploaded document.
   */
  async upload(supplierId, file, type) {
    // Note: Real S3 upload logic should be integrated here if not done in the controller.
    // For now, we use a mock URL for demonstrations.
    const fileUrl = `https://mock-storage.com/${supplierId}/${file.originalname}`;

    return this.prisma.document.create({
      data: {
        supplierId,
        type,
        fileUrl,
      },
    });
  }
}
