import { Controller, Post, Body } from '@nestjs/common';
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

    // LOGIN
    @Post('login')
    login(@Body() body: any) {
        return this.authService.login(
            body.email,
            body.password,
        );
    }
}