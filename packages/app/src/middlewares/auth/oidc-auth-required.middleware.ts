import { middleware } from '@micro/routes/middleware';
import { UnauthorizedError } from '@micro/routes';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyResult } from 'jose';
import type { JwtPayload } from './jwt-payload.type.js';

interface OidcDiscoveryConfig {
  issuer: string;
  jwks_uri: string;
}

const issuer = 'https://auth.home.acevik.de';
const audience = 'local-xvids';
const wellKnownUrl = `${issuer}/.well-known/openid-configuration`;


let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
const getJwks = async () => {
  if (!jwks) {
    const res = await fetch(wellKnownUrl);
    if (!res.ok) {
      throw new Error(
        `Failed to load OIDC config: ${res.status} ${res.statusText}`,
      );
    }

    const cfg = (await res.json()) as OidcDiscoveryConfig;

    jwks = createRemoteJWKSet(new URL(cfg.jwks_uri));
  }

  return jwks;
};

export type OidcAuthContext = JWTVerifyResult<JwtPayload>;

export const oidcAuthRequiredSecuritySchemaName = 'oidcAuth';
// Use a stable context key instead of relying on function `.name`
export const oidcAuthContextKey = oidcAuthRequiredSecuritySchemaName;
export const oidcAuthRequired = middleware(async ({
  req, next,
}) => {
  const token = req?.headers.getAuthToken() ?? null;

  if (!token) {
    throw new UnauthorizedError('Token is required');
  }

  const jwtVerifyResult = await jwtVerify<JwtPayload>(token, await getJwks(), {
    algorithms: ['EdDSA'],
    issuer,
    audience,
  });

  next({
    [oidcAuthContextKey]: jwtVerifyResult,
  });
}).openapi((onExtendRoute, registry) => {
  registry.registerComponent('securitySchemes', oidcAuthRequiredSecuritySchemaName, {
    type: 'openIdConnect',
    openIdConnectUrl: wellKnownUrl,
  });

  onExtendRoute((config) => {
    config.security = config.security ?? [];
    config.security.push({ [oidcAuthRequiredSecuritySchemaName]: [] });
    return config;
  });
});