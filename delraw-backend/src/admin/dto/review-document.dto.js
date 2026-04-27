import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for approving a document. Body is usually empty as ID is in the URL.
 */
export class ApproveDocumentDto {}

/**
 * DTO for rejecting a document. Requires a detailed reason.
 */
export class RejectDocumentDto {
  @ApiProperty({ example: 'The uploaded file is corrupt or unreadable' })
  @IsString()
  @MinLength(5)
  reason;
}
