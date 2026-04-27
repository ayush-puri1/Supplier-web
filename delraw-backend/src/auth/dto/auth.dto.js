import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO to request an OTP for email verification or password reset.
 */
export class SendOtpDto {
  @ApiProperty({ example: 'user@delraw.com' })
  @IsEmail()
  email;
}

/**
 * DTO for the initial supplier registration phase.
 */
export class RegisterDto {
  @ApiProperty({ example: 'supplier@delraw.com' })
  @IsEmail()
  email;

  @ApiProperty({ example: 'securepass123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password;

  @ApiProperty({ required: false, example: 'Alpha Textiles Ltd' })
  @IsOptional()
  @IsString()
  companyName;
}

/**
 * DTO to verify a user's email via the 6-digit OTP.
 */
export class VerifyOtpDto {
  @ApiProperty({ example: 'user@delraw.com' })
  @IsEmail()
  email;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp;

  @ApiProperty({ required: false, description: 'Optional new password' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyName;
}

/**
 * DTO for standard email/password login.
 */
export class LoginDto {
  @ApiProperty({ example: 'user@delraw.com' })
  @IsEmail()
  email;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password;
}

/**
 * DTO to initiate password recovery.
 */
export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@delraw.com' })
  @IsEmail()
  email;
}

/**
 * DTO to finalize password reset using the OTP.
 */
export class ResetPasswordDto {
  @ApiProperty({ example: 'user@delraw.com' })
  @IsEmail()
  email;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  otp;

  @ApiProperty({ example: 'newsecurepass123' })
  @IsString()
  @MinLength(8)
  newPassword;
}

/**
 * DTO for token rotation.
 */
export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refresh_token;
}
