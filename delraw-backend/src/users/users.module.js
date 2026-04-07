import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Module responsible for user data management.
 * Exports UsersService for use in Auth and other modules.
 */
@Module({
    imports: [PrismaModule],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
