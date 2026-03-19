import { IsOptional, IsBoolean, IsInt, Min, Max, IsString, IsEmail } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsOptional() @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional() @IsBoolean()
  supplierAutoApprove?: boolean;

  @IsOptional() @IsBoolean()
  allowNewRegistrations?: boolean;

  @IsOptional() @IsInt() @Min(1) @Max(500)
  maxProductsPerSupplier?: number;

  @IsOptional() @IsString()
  platformName?: string;

  @IsOptional() @IsEmail()
  supportEmail?: string;
}
