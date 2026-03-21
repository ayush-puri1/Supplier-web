import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Passport strategy for validating incoming JWTs.
 * Checks against a revocation list and verifies that the user account is not suspended.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     * @param {import('../../prisma/prisma.service').PrismaService} prisma
     */
    constructor(prisma) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'delraw_secret',
            passReqToCallback: true,
        });
        this.prisma = prisma;
    }

    /**
     * Validates the decoded JWT payload.
     * @param {Object} req - The original Express request.
     * @param {Object} payload - The decoded token contents.
     */
    async validate(req, payload) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        // Security check: Verify if the token was specifically revoked (e.g., via logout)
        if (token) {
            const isRevoked = await this.prisma.revokedToken.findUnique({
                where: { token },
            });
            if (isRevoked) throw new UnauthorizedException('Token has been revoked');
        }

        // Integrity check: Verify user still exists and is not disabled
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { isActive: true },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User account is suspended');
        }

        // Return the user object to be attached to req.user
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
