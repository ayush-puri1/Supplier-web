import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service to manage the database connection using Prisma Client.
 * Automatically connects and disconnects when the application starts/stops.
 * This class inherits from PrismaClient to provide direct database access.
 */
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }

  /**
   * Called when the module is initialized.
   * Establishes the connection to the PostgreSQL database.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Called when the module is destroyed.
   * Safely closes the database connection to prevent resource leaks.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
