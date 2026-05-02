import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Module for global platform search.
 * Uses PostgreSQL (Prisma) for case-insensitive text searching.
 */
@Module({
  imports: [PrismaModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
