import { middleware, type Middleware } from '@micro/routes/middleware';
import { ForbiddenError } from '@micro/routes';
import { type Role } from './roles.enum.js';
import {
  OidcAuthContext,
  oidcAuthRequired,
  oidcAuthRequiredSecuritySchemaName,
} from './oidc-auth-required.middleware.js';

const createRoleMiddleware = (role: Role) => {
  return middleware(async ({ req, next, prevParams }) => {
    const authContext = prevParams?.[oidcAuthRequired.name as string] as OidcAuthContext | undefined;

    if (!authContext || !authContext.payload) {
      throw new ForbiddenError('Authentication context missing');
    }

    const userRoles = (authContext.payload.roles as string[]) || [];

    if (!userRoles.includes(role)) {
      throw new ForbiddenError(`Missing required role: ${role}`);
    }

    next();
  })
    .after(oidcAuthRequired)
    .openapi((onExtendRoute) => {
      onExtendRoute((config) => {
        config.security = config.security?.map((sec) => {
          if (oidcAuthRequiredSecuritySchemaName in sec) {
            const currentScopes = sec[oidcAuthRequiredSecuritySchemaName];
            const newScopes = Array.from(new Set([...currentScopes, role]));

            return {
              ...sec,
              [oidcAuthRequiredSecuritySchemaName]: newScopes,
            };
          }
          return sec;
        });

        return config;
      });
    });
};

export const isAdminMiddleware = createRoleMiddleware('admin');
export const isModeratorMiddleware = createRoleMiddleware('moderator');
export const isUserMiddleware = createRoleMiddleware('user');

export const roleRequired = (role: Role): Middleware => {
  switch (role) {
  case 'user': return isUserMiddleware;
  case 'moderator': return isModeratorMiddleware;
  case 'admin': return isAdminMiddleware;
  }
};