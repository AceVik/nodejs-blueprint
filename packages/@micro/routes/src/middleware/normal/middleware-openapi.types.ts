import type { SecuritySchemeObject, ParameterObject } from 'openapi3-ts/oas31';

export type MiddlewareOpenApiMeta = {
  securitySchemes?: Record<string, SecuritySchemeObject>;
  security?: Array<Record<string, string[]>>;
  parameters?: ParameterObject[];
  produces?: string[];
  overrideProduces?: boolean;
};
