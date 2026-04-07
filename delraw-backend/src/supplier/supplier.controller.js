import { Bind, Controller,
    Get,
    Patch,
    Post,
    Body,
    Req,
    Param,
    UseGuards, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { SupplierService } from './supplier.service';

/**
 * Controller for supplier-facing features and profile management.
 * All routes here require valid JWT authentication.
 */
@Controller('supplier')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SupplierController {
    constructor(service) {
        this.service = service;
    }

    /**
     * GET /supplier/me
     * Returns the full profile details for the logged-in supplier.
     */
    @Get('me')
    @Bind(Req())
    getProfile(req) {
        return this.service.getProfile(req.user.userId);
    }

    /**
     * PATCH /supplier/me
     * Allows suppliers to update their business information manually.
     */
    @Patch('me')
    @Bind(Req(), Body())
    updateProfile(req, body) {
        return this.service.updateProfile(req.user.userId, body);
    }

    /**
     * POST /supplier/submit
     * Triggers the onboarding review process for the supplier.
     */
    @Post('submit')
    @Bind(Req())
    submit(req) {
        return this.service.submit(req.user.userId);
    }

    /**
     * GET /supplier/dashboard
     * Fetches summarized performance metrics for the supplier portal home.
     */
    @Get('dashboard')
    @Bind(Req())
    getDashboardStats(req) {
        return this.service.getDashboardStats(req.user.userId);
    }

    /**
     * GET /supplier/notifications
     * Fetches all direct system notifications for the supplier.
     */
    @Get('notifications')
    @Bind(Req())
    getNotifications(req) {
        return this.service.getNotifications(req.user.userId);
    }

    /**
     * PATCH /supplier/notifications/:id/read
     * Marks a specific notification as seen.
     */
    @Patch('notifications/:id/read')
    @Bind(Req(), Param('id'))
    markNotificationAsRead(req, id) {
        return this.service.markNotificationAsRead(req.user.userId, id);
    }
}
