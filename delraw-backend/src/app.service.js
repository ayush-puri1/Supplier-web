import { Injectable } from '@nestjs/common';

/**
 * Basic application service for health checks and root-level logic.
 * Primarily serves as a placeholder for non-module-specific logic.
 */
@Injectable()
export class AppService {
  /**
   * Simple welcome message to confirm the API is responsive.
   * @returns {string}
   */
  getHello() {
    return 'Delraw API is running!';
  }
}
