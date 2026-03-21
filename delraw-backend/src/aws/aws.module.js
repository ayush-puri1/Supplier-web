import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';

/**
 * Module to provide AWS S3 capabilities to the rest of the application.
 */
@Module({
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
