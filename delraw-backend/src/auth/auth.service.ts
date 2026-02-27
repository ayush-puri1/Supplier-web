import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) { }

    // =============================
    // REGISTER
    // =============================
    async register(email: string, password: string, companyName?: string) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            throw new BadRequestException('Email already exists');
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hash,
                role: 'SUPPLIER',
            },
        });

        // Auto-create supplier profile
        await this.prisma.supplier.create({
            data: {
                userId: user.id,
                companyName: companyName || 'Pending Setup',
                gstNumber: '',
                address: '',
                city: '',
                country: '',
                yearEstablished: 0,
                workforceSize: 0,
                monthlyCapacity: 0,
                moq: 0,
                leadTimeDays: 0,
                responseTimeHr: 0,
                status: 'DRAFT',
            },
        });

        return this.generateTokenResponse(user.id, user.email, user.role);
    }

    // =============================
    // LOGIN
    // =============================
    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokenResponse(user.id, user.email, user.role);
    }

    // =============================
    // JWT
    // =============================
    private generateTokenResponse(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };
        return {
            access_token: this.jwt.sign(payload),
            user: {
                id: userId,
                email,
                role,
            },
        };
    }
}