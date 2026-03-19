import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveDocumentDto {
  // no body needed, documentId comes from URL param
}

export class RejectDocumentDto {
  @ApiProperty({ example: 'Document is blurry and unreadable' })
  @IsString()
  reason: string;
}
