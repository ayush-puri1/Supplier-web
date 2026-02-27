import {
    Controller,
    Get,
    Patch,
    Post,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';

import { SupplierService } from './supplier.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('supplier')   // 👈 VERY IMPORTANT
@UseGuards(AuthGuard('jwt'))
export class SupplierController {
    constructor(private service: SupplierService) { }

    @Get('me')               // 👈 VERY IMPORTANT
    getProfile(@Req() req: any) {
        return this.service.getProfile(req.user.sub);
    }

    @Patch('me')
    updateProfile(@Req() req: any, @Body() body: any) {
        return this.service.updateProfile(req.user.sub, body);
    }

    @Post('submit')
    submit(@Req() req: any) {
        return this.service.submit(req.user.sub);
    }
}