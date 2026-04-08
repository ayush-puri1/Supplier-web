import {
    Injectable,
    Inject,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { SessionService } from './session.service';

/**
 * Service providing core authentication, registration, and session management.
 * Handles password hashing, JWT generation, OTP lifecycle, and token revocation.
 */
@Injectable()
export class AuthService {
    /**
     * @param {PrismaService} prisma
     * @param {JwtService} jwt
     * @param {MailService} mail
     * @param {AuditService} audit
     * @param {SessionService} sessionService
     */
    constructor(
        @Inject(PrismaService) prisma,
        @Inject(JwtService) jwt,
        @Inject(MailService) mail,
        @Inject(AuditService) audit,
        @Inject(SessionService) sessionService,
    ) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.mail = mail;
        this.audit = audit;
        this.sessionService = sessionService;
    }

    /**
     * Hashes a sensitive token using Bcrypt.
     */
    async hashToken(token) {
        return bcrypt.hash(token, 10);
    }

    /**
     * Registers a new supplier user and creates their draft profile.
     */
    async register(email, password, companyName) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) throw new BadRequestException('Email already exists');

        const hash = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hash,
                role: 'SUPPLIER',
            },
        });

        await this.prisma.supplier.create({
            data: {
                userId: user.id,
                companyName: companyName || 'Pending Setup',
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

    /**
     * Generates and sends a 6-digit OTP to the user's email.
     */
    async sendOtp(email) {
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (user && user.isEmailVerified) throw new BadRequestException('Email already verified');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        const placeholderPass = await bcrypt.hash('TEMP_PASS_OTP', 10);

        if (user) {
            await this.prisma.user.update({
                where: { email },
                data: { otp, otpExpiry, otpAttempts: 0 },
            });
        } else {
            await this.prisma.user.create({
                data: {
                    email,
                    password: placeholderPass,
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

    /**
     * Verifies the OTP and activates the user account.
     */
    async verifyOtp(email, otp, password, companyName) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new BadRequestException('User not found');
        if (user.isEmailVerified) throw new BadRequestException('Email already verified');

        // Enforcement of retry limits
        if (user.otpAttempts >= 5) {
            const lockoutTime = 15 * 60 * 1000;
            if (user.otpLastAttempt && (new Date().getTime() - user.otpLastAttempt.getTime() < lockoutTime)) {
                throw new BadRequestException('Too many failed attempts. Try again later.');
            }
        }

        if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date() || user.otp !== otp) {
            await this.prisma.user.update({
                where: { email },
                data: { otpAttempts: { increment: 1 }, otpLastAttempt: new Date() },
            });
            throw new BadRequestException('Invalid or expired OTP');
        }

        const dataToUpdate = {
            isEmailVerified: true,
            otp: null,
            otpExpiry: null,
            otpAttempts: 0,
            otpLastAttempt: null,
        };

        if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

        const updatedUser = await this.prisma.user.update({
            where: { email },
            data: dataToUpdate,
        });

        // Ensure supplier profile exists upon verification
        if (updatedUser.role === 'SUPPLIER') {
            const supplier = await this.prisma.supplier.findUnique({ where: { userId: user.id } });
            if (!supplier) {
                await this.prisma.supplier.create({
                    data: { userId: user.id, companyName: companyName || 'Pending Setup', status: 'DRAFT' },
                });
            }
        }

        await this.audit.log({
            actorId: updatedUser.id,
            actorEmail: updatedUser.email,
            action: 'USER_VERIFIED',
            entityType: 'User',
            entityId: updatedUser.id,
            details: `User email verified: ${email}`,
        });

        return this.generateTokenResponse(updatedUser.id, updatedUser.email, updatedUser.role);
    }

    /**
     * Authenticates a user and creates a new tracking session.
     */
    async login(email, password, req) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new UnauthorizedException('Invalid credentials');

        await this.audit.log({
            actorId: user.id,
            actorEmail: user.email,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: user.id,
            details: `User logged in from ${req.ip}`,
        });

        const tokens = await this.generateTokenResponse(user.id, user.email, user.role);

        // Record the session for device management
        const sessionExpiry = new Date();
        sessionExpiry.setDate(sessionExpiry.getDate() + 7);
        await this.sessionService.createSession({
            userId: user.id,
            ipAddress: req.ip || 'unknown',
            userAgent: req.headers?.['user-agent'] || 'unknown',
            expiresAt: sessionExpiry,
        });

        return tokens;
    }

    /**
     * Exchanges a valid refresh token for a fresh short-lived access token.
     */
    async refreshAccessToken(rawRefreshToken) {
        const [userId] = rawRefreshToken.split('.');
        if (!userId) throw new UnauthorizedException('Invalid refresh token');

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
            throw new UnauthorizedException('No active session');
        }

        if (new Date() > user.refreshTokenExpiresAt) throw new UnauthorizedException('Refresh token expired');

        const isValid = await bcrypt.compare(rawRefreshToken, user.refreshTokenHash);
        if (!isValid) throw new UnauthorizedException('Invalid refresh token');

        return {
            access_token: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' }),
        };
    }

    /**
     * Internal helper to generate a pair of JWTs (Access + Refresh).
     */
    async generateTokenResponse(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });

        // Generate a cryptographically secure refresh token
        const rawRefreshToken = `${userId}.${uuidv4()}-${uuidv4()}`;
        const refreshTokenHash = await this.hashToken(rawRefreshToken);
        const refreshTokenExpiresAt = new Date();
        refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash, refreshTokenExpiresAt },
        });

        return {
            access_token: accessToken,
            refresh_token: rawRefreshToken,
            user: { id: userId, email, role },
        };
    }

    /**
     * Revokes all active tokens and sessions for the user.
     */
    async logout(token, userId) {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { refreshTokenHash: null, refreshTokenExpiresAt: null },
            });

            await this.sessionService.deactivateAllSessions(userId);

            const decoded = this.jwt.decode(token);
            if (decoded && decoded.exp) {
                const expiresAt = new Date(decoded.exp * 1000);
                // Blacklist the access token until its natural expiry
                await this.prisma.revokedToken.create({
                    data: {
                        token,
                        userId,
                        expiresAt,
                        reason: 'User logged out',
                    },
                }).catch(() => {}); // Ignore duplicate revocation errors
            }

            await this.audit.log({
                actorId: userId,
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

    /**
     * Triggers the password recovery workflow.
     */
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return { message: 'Reset code sent if email exists' };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        await this.prisma.user.update({
            where: { email },
            data: { passwordResetOtp: otp, passwordResetExpiry: otpExpiry },
        });

        await this.mail.sendOtpEmail(email, otp);
        return { message: 'Reset code sent if email exists' };
    }

    /**
     * Finalizes password reset after OTP verification.
     */
    async resetPassword(email, otp, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || user.passwordResetOtp !== otp) throw new UnauthorizedException('Invalid or expired OTP');

        if (user.passwordResetExpiry && new Date() > user.passwordResetExpiry) throw new UnauthorizedException('OTP expired');

        if (password) {
            const hash = await bcrypt.hash(password, 10);
            await this.prisma.user.update({
                where: { email },
                data: {
                    password: hash,
                    passwordResetOtp: null,
                    passwordResetExpiry: null,
                    refreshTokenHash: null, // Global logout upon security reset
                    refreshTokenExpiresAt: null,
                },
            });
        }

        return { message: 'Password reset successful' };
    }
}
