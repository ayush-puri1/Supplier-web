import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that enforces valid JWT authentication for routes.
 * Inherits from NestJS Passport's AuthGuard.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
