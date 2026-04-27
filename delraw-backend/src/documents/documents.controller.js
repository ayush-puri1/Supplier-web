import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Request,
  Bind,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { DocumentsService } from './documents.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for handling legal and business document uploads for suppliers.
 */
@ApiTags('Documents')
@Controller('documents')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(@Inject(DocumentsService) documentsService) {
    this.documentsService = documentsService;
  }

  /**
   * POST /documents/upload
   * Uploads a document to GridFS and records metadata in Postgres.
   * Restricts upload capability to users with the SUPPLIER role.
   */
  @Post('upload')
  @Roles('SUPPLIER')
  @UseInterceptors(FileInterceptor('file'))
  @Bind(UploadedFile(), Body(), Request())
  @ApiOperation({ summary: 'Upload a supplier document to GridFS' })
  async uploadFile(file, body, req) {
    // Pass userId (not supplierId) — service resolves the supplier internally
    return this.documentsService.upload(req.user.userId, file, body.type);
  }

  /**
   * GET /documents/my
   * Returns all documents for the currently authenticated supplier.
   */
  @Get('my')
  @Roles('SUPPLIER')
  @Bind(Request())
  @ApiOperation({ summary: 'Get all documents for the current supplier' })
  async getMyDocuments(req) {
    const supplier = await this.documentsService['prisma'].supplier.findUnique({
      where: { userId: req.user.userId },
    });
    if (!supplier) return [];
    return this.documentsService.findBySupplierId(supplier.id);
  }
}
