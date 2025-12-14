import { RequestInterceptor } from '@micro/routes/http';
import { ForbiddenError } from '@micro/routes';
import type { OidcAuthContext, OidcAuthInterceptor } from './oidc-auth.interceptor.js';

export type Role = 'user' | 'moderator' | 'admin';


export class RoleRequiredInterceptor extends RequestInterceptor {
  constructor(private readonly role: Role, private readonly auth: OidcAuthInterceptor) {
    super(voidSchema);
  }

  async intercept({ resolve, next }) {
    const auth = resolve(this.auth) as OidcAuthContext | undefined;

    if (!auth || !auth.payload) {
      throw new ForbiddenError('Authentication context missing');
    }

    const userRoles = (auth.payload.roles as string[]) || [];
    if (!userRoles.includes(this.role)) {
      throw new ForbiddenError(`Missing required role: ${this.role}`);
    }

    await next();
  }

  // Ensure scope is reflected in OpenAPI under the OIDC scheme
  openapi({ onExtendRoute }) {
    onExtendRoute((config) => {
      const scheme = (this.auth.constructor as typeof OidcAuthInterceptor).securitySchemeName;
      config.security = config.security ?? [];
      const entry = config.security.find((s) => scheme in s);
      if (entry) {
        const scopes = (entry as any)[scheme] as string[];
        const nextScopes = Array.from(new Set([...(scopes ?? []), this.role]));
        (entry as any)[scheme] = nextScopes;
      } else {
        config.security.push({ [scheme]: [this.role] });
      }
      return config;
    });
  }
}

export const roleRequired = (role: Role, auth: OidcAuthInterceptor) => new RoleRequiredInterceptor(role, auth);
