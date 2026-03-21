import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for handling pagination parameters in API requests.
 * Defines the 'skip' and 'take' parameters used for list-based endpoints.
 */
export class PaginationDto {
  /**
   * Number of items to skip (offset).
   */
  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  skip = 0;

  /**
   * Number of items to take (limit).
   */
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  take = 20;
}
