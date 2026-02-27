import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService) { }

    async upload(supplierId: string, file: any, type: string) {
        // In a real app, upload to S3 here.
        // For now, we mock it and return a fake URL.
        const fileUrl = `https://mock-storage.com/${supplierId}/${file.originalname}`;

        return this.prisma.document.create({
            data: {
                supplierId,
                type,
                fileUrl,
                verified: false,
            },
        });
    }
}
