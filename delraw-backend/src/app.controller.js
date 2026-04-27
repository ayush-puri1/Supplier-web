import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root controller for the application.
 * Handles the base '/' route.
 */
@Controller()
export class AppController {
  /**
   * @param {AppService} appService
   */
  constructor(@Inject(AppService) appService) {
    this.appService = appService;
  }

  /**
   * GET /
   * Returns a standard greeting to verify service availability.
   */
  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
