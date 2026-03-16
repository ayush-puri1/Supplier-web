import { Controller, Post, Body, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // REGISTER
    @Post('register')
    register(@Body() body: any) {
        return this.authService.register(
            body.email,
            body.password,
            body.companyName,
        );
    }

    @Post('send-otp')
    sendOtp(@Body() body: any) {
        return this.authService.sendOtp(body.email);
    }

    @Post('verify-otp')
    verifyOtp(@Body() body: any) {
        return this.authService.verifyOtp(
            body.email,
            body.otp,
            body.password,
            body.companyName,
        );
    }

    // LOGIN
    @Post('login')
    login(@Body() body: any) {
        return this.authService.login(
            body.email,
            body.password,
        );
    }

    // LOGOUT
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    logout(@Request() req) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token) throw new UnauthorizedException('Token not found');
        return this.authService.logout(token, req.user.userId);
    }
}