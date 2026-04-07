import { Bind, Controller, Post, Body, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for public and protected authentication endpoints.
 * Includes registration, OTP management, login, and token rotation.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    /**
     * @param {import('./auth.service').AuthService} authService
     */
    constructor(authService) {
        this.authService = authService;
    }

    /**
     * POST /auth/register
     * Initiates supplier enrollment.
     */
    @Post('register')
    @ApiOperation({ summary: 'Register a new supplier' })
    @Bind(Body())
    register(dto) {
        return this.authService.register(dto.email, dto.password, dto.companyName);
    }

    /**
     * POST /auth/send-otp
     * Requests a 6-digit verification code. Rate-limited to prevent abuse.
     */
    @Throttle({ short: { limit: 3, ttl: 60000 } })
    @Post('send-otp')
    @ApiOperation({ summary: 'Send OTP to email' })
    @Bind(Body())
    sendOtp(dto) {
        return this.authService.sendOtp(dto.email);
    }

    /**
     * POST /auth/verify-otp
     * Validates the verification code to activate the account.
     */
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP' })
    @Bind(Body())
    verifyOtp(dto) {
        return this.authService.verifyOtp(dto.email, dto.otp, dto.password, dto.companyName);
    }

    /**
     * POST /auth/login
     * Standard credentials-based login. Returns JWT pair.
     */
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @Bind(Body(), Request())
    login(dto, req) {
        return this.authService.login(dto.email, dto.password, req);
    }

    /**
     * POST /auth/refresh
     * Obtains a new access token using a long-lived refresh token.
     */
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @Bind(Body())
    refresh(dto) {
        return this.authService.refreshAccessToken(dto.refresh_token);
    }

    /**
     * POST /auth/forgot-password
     * Starts the password recovery flow by sending an OTP.
     */
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot password - Send OTP' })
    @Bind(Body())
    forgotPassword(dto) {
        return this.authService.forgotPassword(dto.email);
    }

    /**
     * POST /auth/reset-password
     * Finalizes password reset after verification.
     */
    @Throttle({ short: { limit: 5, ttl: 60000 } })
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with OTP' })
    @Bind(Body())
    resetPassword(dto) {
        return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
    }

    /**
     * POST /auth/logout
     * Revokes the current token and clears the session.
     */
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout and revoke token' })
    @Bind(Request())
    logout(req) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token) throw new UnauthorizedException('Token not found');
        return this.authService.logout(token, req.user.userId);
    }
}
