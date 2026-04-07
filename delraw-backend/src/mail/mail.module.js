import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Global module for handling mail operations.
 * Exports the MailService so it can be used by other features like Auth and Supplier Management.
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
