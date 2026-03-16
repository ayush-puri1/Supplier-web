import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'delraw_secret',
            passReqToCallback: true,
        });
    }

    async validate(req: any, payload: any) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        if (token) {
            const isRevoked = await this.prisma.revokedToken.findUnique({
                where: { token },
            });
            if (isRevoked) {
                throw new UnauthorizedException('Token has been revoked');
            }
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { isActive: true },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User account is suspended');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}