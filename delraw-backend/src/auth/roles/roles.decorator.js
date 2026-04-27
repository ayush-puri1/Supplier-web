import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to specify required user roles for a given route or controller.
 * @param {...string} roles - List of allowed roles (e.g., 'ADMIN', 'SUPPLIER').
 */
export const Roles = (...roles) => SetMetadata('roles', roles);
