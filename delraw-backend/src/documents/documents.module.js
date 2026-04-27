import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

/**
 * Module for handling supplier legal document uploads.
 * - PrismaModule for metadata persistence in Postgres
 * - StorageModule for GridFS binary file handling
 */
@Module({
  imports: [PrismaModule, StorageModule],
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
