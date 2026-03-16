import {
    Controller,
    Get,
    Patch,
    Post,
    Body,
    Req,
    Param,
    UseGuards,
} from '@nestjs/common';

import { SupplierService } from './supplier.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '@prisma/client';

@Controller('supplier')   // 👈 VERY IMPORTANT
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SupplierController {
    constructor(private service: SupplierService) { }

    @Get('me')               // 👈 VERY IMPORTANT
    getProfile(@Req() req: any) {
        return this.service.getProfile(req.user.userId);
    }

    @Patch('me')
    updateProfile(@Req() req: any, @Body() body: any) {
        return this.service.updateProfile(req.user.userId, body);
    }

    @Post('submit')
    submit(@Req() req: any) {
        return this.service.submit(req.user.userId);
    }

    @Get('dashboard')
    getDashboardStats(@Req() req: any) {
        return this.service.getDashboardStats(req.user.userId);
    }

    @Get('notifications')
    getNotifications(@Req() req: any) {
        return this.service.getNotifications(req.user.userId);
    }

    @Patch('notifications/:id/read')
    markNotificationAsRead(@Req() req: any, @Param('id') id: string) {
        return this.service.markNotificationAsRead(req.user.userId, id);
    }
}