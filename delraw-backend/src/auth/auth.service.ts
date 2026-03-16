import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private mail: MailService,
        private audit: AuditService,
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
                panNumber: '',
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

        await this.audit.log({
            actorId: user.id,
            actorEmail: user.email,
            action: 'USER_REGISTERED',
            entityType: 'User',
            entityId: user.id,
            details: `Guest registered as supplier: ${email}`,
        });

        return this.generateTokenResponse(user.id, user.email, user.role);
    }

    // =============================
    // SEND OTP
    // =============================
    async sendOtp(email: string) {
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (user && user.isEmailVerified) throw new BadRequestException('Email already verified and registered');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const hash = await bcrypt.hash('TEMP_PASS_OTP', 10);

        if (user) {
            await this.prisma.user.update({
                where: { email },
                data: { otp, otpExpiry },
            });
        } else {
            await this.prisma.user.create({
                data: {
                    email,
                    password: hash,
                    role: 'SUPPLIER',
                    otp,
                    otpExpiry,
                },
            });
        }

        await this.mail.sendOtpEmail(email, otp);
        return { message: 'OTP sent successfully' };
    }

    // =============================
    // VERIFY OTP
    // =============================
    async verifyOtp(email: string, otp: string, password?: string, companyName?: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new BadRequestException('User not found');
        if (user.isEmailVerified) throw new BadRequestException('Email already verified');

        if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        const dataToUpdate: any = {
            isEmailVerified: true,
            otp: null,
            otpExpiry: null,
        };

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await this.prisma.user.update({
            where: { email },
            data: dataToUpdate,
        });

        if (updatedUser.role === 'SUPPLIER') {
            const supplier = await this.prisma.supplier.findUnique({ where: { userId: user.id } });
            if (!supplier) {
                await this.prisma.supplier.create({
                    data: {
                        userId: user.id,
                        companyName: companyName || 'Pending Setup',
                        gstNumber: '',
                        panNumber: '',
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
            }
        }

        await this.audit.log({
            actorId: updatedUser.id,
            actorEmail: updatedUser.email,
            action: 'USER_VERIFIED',
            entityType: 'User',
            entityId: updatedUser.id,
            details: `User verified email via OTP: ${email}`,
        });

        return this.generateTokenResponse(updatedUser.id, updatedUser.email, updatedUser.role);
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

        await this.audit.log({
            actorId: user.id,
            actorEmail: user.email,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: user.id,
            details: `User logged in`,
        });

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

    // =============================
    // LOGOUT (TOKEN REVOCATION)
    // =============================
    async logout(token: string, userId: string) {
        try {
            const decoded = this.jwt.decode(token) as any;
            if (!decoded || !decoded.exp) {
                return { message: 'Logged out successfully' };
            }

            const expiresAt = new Date(decoded.exp * 1000);

            // Gracefully handle if already revoked (P2002 Unique constraint)
            try {
                await this.prisma.revokedToken.create({
                    data: {
                        token,
                        userId: decoded.sub || userId,
                        expiresAt,
                        reason: 'User logged out',
                    },
                });
            } catch (err: any) {
                if (err.code !== 'P2002') throw err;
            }

            await this.audit.log({
                actorId: userId,
                actorEmail: decoded.email,
                action: 'USER_LOGOUT',
                entityType: 'User',
                entityId: userId,
                details: 'User explicitly logged out',
            });

        } catch (error) {
            console.error('Logout error:', error);
        }
        return { message: 'Logged out successfully' };
    }
}