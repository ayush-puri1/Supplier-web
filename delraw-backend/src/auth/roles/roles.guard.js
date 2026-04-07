import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard that checks if the authenticated user has the necessary roles to access a route.
 * Relies on the @Roles decorator to fetch metadata.
 */
@Injectable()
export class RolesGuard {
  /**
   * @param {import('@nestjs/core').Reflector} reflector
   */
  constructor(reflector) {
    this.reflector = reflector;
   }

  /**
   * Determines if access is granted for the current execution context.
   */
  canActivate(context) {
    const requiredRoles = this.reflector.get('roles', context.getHandler());

    // If no roles are defined, permit access (fallback to JWT guard if present)
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if the user's role matches any of the required roles
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }

    return true;
  }
}
