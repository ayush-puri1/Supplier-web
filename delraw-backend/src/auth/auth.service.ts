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
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private mail: MailService,
        private audit: AuditService,
    ) { }

    private async hashToken(token: string): Promise<string> {
        return bcrypt.hash(token, 10);
    }

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
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        const hash = await bcrypt.hash('TEMP_PASS_OTP', 10);

        if (user) {
            await this.prisma.user.update({
                where: { email },
                data: { otp, otpExpiry, otpAttempts: 0 },
            });
        } else {
            await this.prisma.user.create({
                data: {
                    email,
                    password: hash,
                    role: 'SUPPLIER',
                    otp,
                    otpExpiry,
                    otpAttempts: 0,
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

        const u = user as any;
        if (u.otpAttempts >= 5) {
            const lockoutTime = 15 * 60 * 1000; // 15 mins lockout
            if (u.otpLastAttempt && (new Date().getTime() - u.otpLastAttempt.getTime() < lockoutTime)) {
                throw new BadRequestException('Too many failed attempts. Please try again later.');
            }
        }

        if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date() || user.otp !== otp) {
            await this.prisma.user.update({
                where: { email },
                data: {
                    otpAttempts: { increment: 1 },
                    otpLastAttempt: new Date(),
                } as any,
            });
            throw new BadRequestException('Invalid or expired OTP');
        }

        const dataToUpdate: any = {
            isEmailVerified: true,
            otp: null,
            otpExpiry: null,
            otpAttempts: 0,
            otpLastAttempt: null,
        } as any;

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
    // REFRESH TOKEN
    // =============================
    async refreshAccessToken(rawRefreshToken: string): Promise<{ access_token: string }> {
        // 1. Extract userId from token prefix
        const [userId] = rawRefreshToken.split('.');
        if (!userId) throw new UnauthorizedException('Invalid refresh token');

        // 2. Load user
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
            throw new UnauthorizedException('No active session');
        }

        // 3. Check expiry
        if (new Date() > user.refreshTokenExpiresAt) {
            throw new UnauthorizedException('Refresh token expired');
        }

        // 4. Compare the raw token against the stored hash
        const isValid = await bcrypt.compare(rawRefreshToken, user.refreshTokenHash);
        if (!isValid) throw new UnauthorizedException('Invalid refresh token');

        // 5. Issue a new access token
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwt.sign(payload, { expiresIn: '15m' }),
        };
    }

    // =============================
    // JWT
    // =============================
    private async generateTokenResponse(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
        
        // 1. Generate a secure random refresh token (with userId prefix)
        const rawRefreshToken = `${userId}.${uuidv4()}-${uuidv4()}`;

        // 2. Hash it before saving
        const refreshTokenHash = await this.hashToken(rawRefreshToken);

        // 3. Set expiry (7 days)
        const refreshTokenExpiresAt = new Date();
        refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

        // 4. Save the HASH to the database
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshTokenHash,
                refreshTokenExpiresAt,
            },
        });

        return {
            access_token: accessToken,
            refresh_token: rawRefreshToken,
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
            // 1. Clear refresh token hash
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    refreshTokenHash: null,
                    refreshTokenExpiresAt: null,
                },
            });

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

    // =============================
    // FORGOT PASSWORD
    // =============================
    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        // Never reveal if an email exists
        if (!user) return { message: 'If that email exists, a reset code has been sent' };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        await this.prisma.user.update({
            where: { email },
            data: { 
                passwordResetOtp: otp, 
                passwordResetExpiry: otpExpiry 
            },
        });

        await this.mail.sendOtpEmail(email, otp);
        return { message: 'If that email exists, a reset code has been sent' };
    }

    // =============================
    // RESET PASSWORD
    // =============================
    async resetPassword(email: string, otp: string, password?: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('User not found');

        if (!user.passwordResetOtp) throw new UnauthorizedException('No active session');
        
        if (user.passwordResetExpiry && new Date() > user.passwordResetExpiry) {
            throw new UnauthorizedException('Refresh token expired'); // Following user's error message style or standard
        }

        if (user.passwordResetOtp !== otp) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (password) {
           const hash = await bcrypt.hash(password, 10);
           await this.prisma.user.update({
               where: { email },
               data: {
                   password: hash,
                   passwordResetOtp: null,
                   passwordResetExpiry: null,
                   refreshTokenHash: null, // Force re-login on all devices
                   refreshTokenExpiresAt: null,
               },
           });
        }

        return { message: 'Password reset successful' };
    }
}