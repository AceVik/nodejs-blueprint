import { ForbiddenError, guard } from '@micro/routes';
import { oidcAuthGuard } from '../oidc/oidc-auth.guard.js';
import type { Role } from './roles.enum.js';

/**
 * Authorization Guard (AuthZ).
 * Ensures the authenticated user possesses a specific role.
 *
 * Automatically inherits the security scheme from oidcAuthGuard and extends it with scopes.
 *
 * @param role - The required role.
 */
export const roleRequired = (role: Role) => {
  return guard(async ({ resolve,  next }) => {
    const authContext = resolve(oidcAuthGuard);

    if (!authContext?.payload) {
      throw new ForbiddenError('Authentication context missing');
    }

    const userRoles = authContext.payload.roles || [];

    if (!userRoles.includes(role)) {
      throw new ForbiddenError(`Missing required role: ${role}`);
    }

    await next();
  })
    .after(oidcAuthGuard)
    .openapi({
      scopes: [role],
      description: `Requires the '${role}' role.`,
    });
};

// Pre-configured instances for convenience
export const isUser = roleRequired('user');
export const isModerator = roleRequired('moderator');
export const isAdmin = roleRequired('admin');