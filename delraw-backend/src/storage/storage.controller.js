import { Controller, Get, Param, Res, NotFoundException, Inject } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('files')
export class StorageController {
  constructor(@Inject(StorageService) storageService) {
    this.storageService = storageService;
  }

  @Get(':bucket/:id')
  async getFile(@Param('bucket') bucket, @Param('id') id, @Res() res) {
    try {
      const { stream, metadata } = await this.storageService.getFileStream(id, bucket);
      
      res.set({
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${metadata.filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      });

      stream.pipe(res);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
