import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global module for Prisma database access.
 * Marked as @Global() so that PrismaService can be used in any other module
 * without explicitly importing it in the 'imports' array.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
