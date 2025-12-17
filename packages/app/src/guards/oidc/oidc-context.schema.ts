import { z } from 'zod';
import type { JWTVerifyResult } from 'jose';
import type { JwtPayload } from './jwt-payload.type.js';

/**
 * Zod schema definition for the OIDC Authentication Context.
 * Used to type-check the context provided by the OidcAuthGuard.
 */
export const oidcAuthContextSchema = z.custom<JWTVerifyResult<JwtPayload>>();

export type OidcAuthContext = z.infer<typeof oidcAuthContextSchema>;