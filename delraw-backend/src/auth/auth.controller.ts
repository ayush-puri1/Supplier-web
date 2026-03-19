import { Controller, Post, Body, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
    LoginDto,
    RegisterDto,
    SendOtpDto,
    VerifyOtpDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    RefreshTokenDto
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // REGISTER
    @Post('register')
    @ApiOperation({ summary: 'Register a new supplier' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(
            dto.email,
            dto.password,
            dto.companyName,
        );
    }

    @Throttle({ short: { limit: 3, ttl: 60000 } })
    @Post('send-otp')
    @ApiOperation({ summary: 'Send OTP to email' })
    sendOtp(@Body() dto: SendOtpDto) {
        return this.authService.sendOtp(dto.email);
    }

    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP' })
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(
            dto.email,
            dto.otp,
            dto.password,
            dto.companyName,
        );
    }

    // LOGIN
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(
            dto.email,
            dto.password,
        );
    }

    // REFRESH TOKEN
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshAccessToken(dto.refresh_token);
    }

    // PASSWORD RESET
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot password - Send OTP' })
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with OTP' })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(
            dto.email,
            dto.otp,
            dto.newPassword,
        );
    }

    // LOGOUT
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout and revoke token' })
    logout(@Request() req) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token) throw new UnauthorizedException('Token not found');
        return this.authService.logout(token, req.user.userId);
    }
}