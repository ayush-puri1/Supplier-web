import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard that checks if the authenticated user has the necessary roles to access a route.
 * Relies on the @Roles decorator to fetch metadata.
 */
@Injectable()
export class RolesGuard {
  /**
   * @param {Reflector} reflector
   */
  constructor(@Inject(Reflector) reflector) {
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

    if (!user) {
      throw new ForbiddenException('Access denied: No user found');
    }

    const roleHierarchy = {
      SUPPLIER: 0,
      ADMIN: 1,
      SUPER_ADMIN: 2,
    };

    const userRoleValue = roleHierarchy[user.role] ?? -1;

    // A user can access if their role value is >= the value of any required role
    const isAuthorized = requiredRoles.some((role) => {
      const requiredValue = roleHierarchy[role] ?? 999; // If unknown role, default to very high requirement
      return userRoleValue >= requiredValue;
    });

    if (!isAuthorized) {
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }

    return true;
  }
}
