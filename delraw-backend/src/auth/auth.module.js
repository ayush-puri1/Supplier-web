import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-strategy/jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { AuditModule } from '../audit/audit.module';
import { SessionService } from './session.service';

/**
 * Authentication module providing identity services across the platform.
 * Registers JWT with platform secrets and exports services for global reuse.
 */
@Module({
  imports: [
    PrismaModule,
    MailModule,
    AuditModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'delraw_jwt_2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, SessionService],
  controllers: [AuthController],
  exports: [AuthService, SessionService],
})
export class AuthModule {}
