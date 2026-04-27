import {
  Controller,
  Get,
  Param,
  Res,
  Inject,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Controller to serve GridFS-stored files over HTTP.
 * Files are accessed at: GET /files/:bucket/:id
 *
 * Example:
 *   GET /files/products/6634a1b2e4f00c12d3a45678
 *   GET /files/documents/6634a1b2e4f00c12d3a45679
 */
@ApiTags('Files')
@Controller('files')
export class StorageController {
  constructor(@Inject(StorageService) storageService) {
    this.storageService = storageService;
  }

  /**
   * Streams a file from GridFS by bucket name and ObjectId.
   * Sets Content-Type and Cache-Control headers automatically.
   */
  @Get(':bucket/:id')
  @ApiOperation({ summary: 'Stream a stored file from GridFS' })
  async getFile(@Param('bucket') bucket, @Param('id') id, @Res() res) {
    return this.storageService.streamFile(id, bucket, res);
  }
}
