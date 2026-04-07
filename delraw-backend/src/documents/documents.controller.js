import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body, Request, Bind } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';

/**
 * Controller for handling legal and business document uploads for suppliers.
 */
@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }

    /**
     * POST /documents/upload
     * Restricts upload capability to users with the SUPPLIER role.
     * Extracts 'file' from multipart form-data.
     */
    @Post('upload')
    @Roles('SUPPLIER')
    @UseInterceptors(FileInterceptor('file'))
    @Bind(UploadedFile(), Body(), Request())
    async uploadFile(file, body, req) {
        return this.documentsService.upload(req.user.userId, file, body.type);
    }
}
