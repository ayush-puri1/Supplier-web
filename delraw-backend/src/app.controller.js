import { Controller, Get } from '@nestjs/common';

/**
 * Root controller for the application.
 * Handles the base '/' route.
 */
@Controller()
export class AppController {
  /**
   * @param {import('./app.service').AppService} appService
   */
  constructor(appService) {
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
