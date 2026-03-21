import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for product variants (e.g., different sizes or colors).
 */
export class ProductVariantDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sku;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock;
}

/**
 * DTO for creating a new product catalog entry.
 */
export class CreateProductDto {
  @ApiProperty({ example: 'Industrial Textile Roll' })
  @IsString()
  @IsNotEmpty()
  name;

  @ApiPropertyOptional({ example: 'Heavy-duty textile for automotive industry' })
  @IsString()
  @IsOptional()
  description;

  @ApiProperty({ example: 'Textiles' })
  @IsString()
  @IsNotEmpty()
  category;

  @ApiPropertyOptional()
  @IsOptional()
  specs;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  moq;

  @ApiPropertyOptional({ example: 7 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  leadTime;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price;

  @ApiPropertyOptional({ example: 'meters' })
  @IsString()
  @IsOptional()
  unit;

  @ApiPropertyOptional({ type: [String], description: 'List of pre-uploaded S3 image keys or URLs' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images;

  @ApiPropertyOptional({ type: [ProductVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants;
}

/**
 * DTO for partially updating an existing product.
 */
export class UpdateProductDto {
  @IsString() @IsOptional() name;
  @IsString() @IsOptional() description;
  @IsString() @IsOptional() category;
  @IsOptional() specs;
  @IsNumber() @Min(0) @IsOptional() moq;
  @IsNumber() @Min(0) @IsOptional() leadTime;
  @IsNumber() @IsOptional() price;
  @IsString() @IsOptional() unit;
  @IsArray() @IsString({ each: true }) @IsOptional() images;
}
