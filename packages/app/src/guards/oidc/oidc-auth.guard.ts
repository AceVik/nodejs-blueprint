import { createRemoteJWKSet, jwtVerify } from 'jose';
import { guard, UnauthorizedError } from '@micro/routes';
import { oidcAuthContextSchema, type OidcAuthContext } from './oidc-context.schema.js';
import type { JwtPayload } from './jwt-payload.type.js';

const ISSUER = 'https://auth.home.acevik.de';
const AUDIENCE = 'local-xvids';
const WELL_KNOWN_URL = `${ISSUER}/.well-known/openid-configuration`;

// Lazy initialization for JWKS to avoid top-level async or repeated fetches
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

const getJwks = async () => {
  if (!jwks) {
    const res = await fetch(WELL_KNOWN_URL);
    if (!res.ok) {
      throw new Error(`Failed to load OIDC config: ${res.status} ${res.statusText}`);
    }
    const cfg = await res.json();
    jwks = createRemoteJWKSet(new URL(cfg.jwks_uri));
  }
  return jwks;
};

/**
 * Authentication Guard (AuthN).
 * Verifies the JWT token against the OIDC provider and establishes the user identity.
 *
 * Registers the 'oidcAuth' security scheme in OpenAPI.
 */
export const oidcAuthGuard = guard<typeof oidcAuthContextSchema>(async ({ req, provide, next }) => {
  const token = req.headers.getAuthToken();

  if (!token) {
    throw new UnauthorizedError('Token is required');
  }

  const result = await jwtVerify<JwtPayload>(token, await getJwks(), {
    algorithms: ['EdDSA'],
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  provide(result as OidcAuthContext);
  await next();
}).openapi({
  name: 'oidcAuth',
  type: 'openIdConnect',
  openIdConnectUrl: WELL_KNOWN_URL,
});