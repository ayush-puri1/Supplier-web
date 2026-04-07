import { IsOptional, IsBoolean, IsInt, Min, Max, IsString, IsEmail } from 'class-validator';

/**
 * DTO for updating global platform behavior and limits.
 */
export class UpdateSystemConfigDto {
  @IsOptional() @IsBoolean()
  maintenanceMode;

  @IsOptional() @IsBoolean()
  supplierAutoApprove;

  @IsOptional() @IsBoolean()
  allowNewRegistrations;

  @IsOptional() @IsInt() @Min(1) @Max(500)
  maxProductsPerSupplier;

  @IsOptional() @IsString()
  platformName;

  @IsOptional() @IsEmail()
  supportEmail;
}
