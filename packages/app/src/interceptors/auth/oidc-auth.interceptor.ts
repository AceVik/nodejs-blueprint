import { RequestInterceptor, type RequestInterceptParams, UnauthorizedError } from '@micro/routes';
import { z, type ZodType } from 'zod';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyResult } from 'jose';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

type JwtPayload = Record<string, unknown> & {
  sub?: string;
  email?: string;
  roles?: string[];
};

type OidcDiscoveryConfig = {
  issuer: string;
  jwks_uri: string;
};

export type OidcAuthContext = JWTVerifyResult<JwtPayload>;

const oidcAuthSchema = z.any() as unknown as ZodType<OidcAuthContext>;

export type OidcAuthConfig = {
  issuer: string;
  audience: string;
};

/**
 * Interceptor for OpenID Connect authentication.
 * Validates JWT tokens against a remote JWKS from the issuer.
 */
export class OidcAuthInterceptor extends RequestInterceptor<typeof oidcAuthSchema> {
  private readonly issuer: string;
  private readonly audience: string;
  private readonly wellKnownUrl: string;
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  public static readonly securitySchemeName = 'oidcAuth';

  constructor(cfg: OidcAuthConfig) {
    super(oidcAuthSchema);
    this.issuer = cfg.issuer;
    this.audience = cfg.audience;
    this.wellKnownUrl = `${cfg.issuer}/.well-known/openid-configuration`;

    super.openapi(({ onExtendRoute }, registry: OpenAPIRegistry) => {
      registry.registerComponent('securitySchemes', OidcAuthInterceptor.securitySchemeName, {
        type: 'openIdConnect',
        openIdConnectUrl: this.wellKnownUrl,
      });

      onExtendRoute((config) => {
        config.security = config.security ?? [];
        config.security.push({ [OidcAuthInterceptor.securitySchemeName]: [] });
        return config;
      });
    });
  }

  private async getJwks() {
    if (!this.jwks) {
      const res = await fetch(this.wellKnownUrl);
      if (!res.ok) {
        throw new Error(`Failed to load OIDC config: ${res.status} ${res.statusText}`);
      }
      const cfg = (await res.json()) as OidcDiscoveryConfig;
      this.jwks = createRemoteJWKSet(new URL(cfg.jwks_uri));
    }
    return this.jwks;
  }

  /**
   * Validates the Authorization header token.
   *
   * @param params - The interception parameters.
   * @throws {UnauthorizedError} If the token is missing or invalid.
   */
  override async intercept({ req, provide, next }: RequestInterceptParams<typeof oidcAuthSchema>) {
    const token = req.headers.getAuthToken();

    if (!token) {
      throw new UnauthorizedError('Token is required');
    }

    const result = await jwtVerify<JwtPayload>(token, await this.getJwks(), {
      algorithms: ['EdDSA', 'RS256', 'ES256'],
      issuer: this.issuer,
      audience: this.audience,
    });

    provide(result);
    await next();
  }
}