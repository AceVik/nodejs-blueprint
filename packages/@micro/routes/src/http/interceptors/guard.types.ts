import type { SecuritySchemeObject } from 'openapi3-ts/oas31';

/**
 * Base configuration for any security scheme.
 */
type GuardBase = {
  /**
   * The unique name of the security scheme in the OpenAPI components.
   */
  name: string;
  /**
   * A description for security scheme.
   */
  description?: string;
};

/**
 * Configuration for HTTP security schemes (e.g., Bearer, Basic).
 */
export type GuardHttp = GuardBase & {
  type: 'http';
  scheme: 'bearer' | 'basic' | string;
  bearerFormat?: string;
};

/**
 * Configuration for API Key security schemes.
 */
export type GuardApiKey = GuardBase & {
  type: 'apiKey';
  in: 'header' | 'query' | 'cookie';
  name: string;
};

/**
 * Configuration for OpenID Connect security schemes.
 */
export type GuardOpenIdConnect = GuardBase & {
  type: 'openIdConnect';
  openIdConnectUrl: string;
};

/**
 * Configuration for OAuth2 security schemes.
 */
export type GuardOAuth2 = GuardBase & {
  type: 'oauth2';
  flows: SecuritySchemeObject['flows'];
};

/**
 * Configuration for Mutual TLS security schemes.
 */
export type GuardMutualTLS = GuardBase & {
  type: 'mutualTLS';
};

/**
 * Union type representing all possible configuration shapes for a Guard.
 * This type enforces strict OpenAPI 3.1 compliance based on the 'type' discriminator.
 */
export type GuardParams =
  | GuardHttp
  | GuardApiKey
  | GuardOpenIdConnect
  | GuardOAuth2
  | GuardMutualTLS;