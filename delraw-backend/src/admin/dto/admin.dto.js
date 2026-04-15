import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  IsEmail,
} from 'class-validator';

/**
 * DTO for updating a supplier's status.
 */
export class UpdateSupplierStatusDto {
  @ApiProperty({
    example: 'VERIFIED',
    description: 'New status for the supplier',
  })
  @IsEnum([
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'VERIFIED',
    'REJECTED',
    'CONDITIONAL',
    'SUSPENDED',
  ])
  status;

  @ApiPropertyOptional({
    description: 'Reason if the status is being set to REJECTED',
  })
  @IsString()
  @IsOptional()
  rejectionReason;
}

/**
 * DTO for updating a product's status.
 */
export class UpdateProductStatusDto {
  @ApiProperty({ example: 'LIVE', description: 'New status for the product' })
  @IsEnum(['DRAFT', 'PENDING_APPROVAL', 'LIVE', 'REJECTED', 'DELISTED'])
  status;

  @ApiPropertyOptional({
    description: 'Reason if the status is being set to REJECTED',
  })
  @IsString()
  @IsOptional()
  rejectionReason;
}

/**
 * DTO for creating a new internal administrator.
 */
export class CreateAdminDto {
  @ApiProperty({ example: 'admin@delraw.com' })
  @IsEmail()
  @IsNotEmpty()
  email;

  @ApiProperty({ example: 'securepassword123' })
  @IsString()
  @MinLength(8)
  password;
}

/**
 * DTO for changing a user's role.
 */
export class UpdateUserRoleDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsEnum(['GUEST', 'SUPPLIER', 'ADMIN', 'SUPER_ADMIN'])
  role;
}

/**
 * DTO for toggling user account access.
 */
export class UpdateUserActiveDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive;
}

/**
 * DTO for administrative password override.
 */
export class ForcePasswordResetDto {
  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(8)
  newPassword;
}
