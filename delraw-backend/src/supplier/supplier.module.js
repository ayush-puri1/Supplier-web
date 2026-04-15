import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Module dedicated to supplier lifecycle management.
 * Handles profiles, compliance submission, and dashboard metadata.
 */
@Module({
  imports: [PrismaModule],
  providers: [SupplierService],
  controllers: [SupplierController],
})
export class SupplierModule {}
