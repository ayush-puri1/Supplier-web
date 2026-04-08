import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service to manage user-related data operations, primarily for authentication 
 * and profile retrieval.
 */
@Injectable()
export class UsersService {
    /**
     * @param {import('../prisma/prisma.service').PrismaService} prisma
     */
    constructor(@Inject(PrismaService) prisma) {
        this.prisma = prisma;
    }

    /**
     * Finds a user by their unique email address.
     * @param {string} email - The email address to search for.
     * @returns {Promise<Object|null>} The user record if found, otherwise null.
     */
    async findOne(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Creates a new user record in the database.
     * Used during registration or when an admin creates a user.
     * @param {Object} data - The user creation parameters.
     * @returns {Promise<Object>} The newly created user.
     */
    async create(data) {
        return this.prisma.user.create({
            data,
        });
    }
}
