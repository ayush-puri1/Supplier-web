import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

/**
 * Module for GridFS-based file storage.
 * Replaces the former AwsModule.
 * MongooseModule connection is inherited from AppModule root registration.
 */
@Module({
  providers: [StorageService],
  controllers: [StorageController],
  exports: [StorageService],
})
export class StorageModule {}
