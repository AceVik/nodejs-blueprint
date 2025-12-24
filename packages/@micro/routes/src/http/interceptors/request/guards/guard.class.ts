import type { ZodType, ZodVoid } from 'zod';
import type { SecuritySchemeObject } from 'openapi3-ts/oas31';
import type { GuardParams } from './guard.types.js';
import { RequestInterceptor, type RequestInterceptorHandler } from '../request-interceptor.class.js';
import { type OpenApiExtender } from '../../../../openapi/index.js';

/**
 * Configuration for defining an Authorization requirement (AuthZ).
 */
export type GuardScopeParams = {
  /**
   * The scopes/roles required by this guard.
   */
  scopes: string[];
  /**
   * Optional description for the documentation.
   */
  description?: string;
};

/**
 * A specialized RequestInterceptor for Authentication and Authorization.
 * Capable of inheriting security scheme definitions from parent guards.
 */
export class Guard<S extends ZodType = ZodVoid> extends RequestInterceptor<S> {
  private _openapiParams?: GuardParams;
  private _securitySchemeName?: string;

  constructor(handler: RequestInterceptorHandler) {
    super(handler);
  }

  /**
   * Declares a dependency.
   * Checks if the parent is a Guard to inherit its security scheme context immediately.
   */
  public override after(parent: RequestInterceptor): this {
    super.after(parent);
    this.tryInheritScheme(parent);
    return this;
  }

  /**
   * Configures the OpenAPI definition for this guard.
   *
   * Overloads allow defining a full Security Scheme (AuthN),
   * extending Scopes (AuthZ), or using a standard extender.
   */
  public override openapi(builder: OpenApiExtender): this;
  public override openapi(config: GuardParams): this;
  public override openapi(config: GuardScopeParams): this;
  public override openapi(configOrBuilder: GuardParams | GuardScopeParams | OpenApiExtender): this {
    // Case 0: Standard OpenApiExtender (Base class compatibility)
    if (typeof configOrBuilder === 'function') {
      return super.openapi(configOrBuilder);
    }

    const config = configOrBuilder;

    // CASE 1: Full Security Scheme Definition (AuthN)
    if ('type' in config && 'name' in config) {
      this._securitySchemeName = config.name;
      this._openapiParams = config;
      const { name, ...schemeConfig } = config;

      return super.openapi(({ onExtendRoute }, registry) => {
        registry.registerComponent('securitySchemes', name, schemeConfig as SecuritySchemeObject);

        onExtendRoute((routeConfig) => {
          routeConfig.security = routeConfig.security ?? [];
          routeConfig.security.push({ [name]: [] });
          return routeConfig;
        });
      });
    }

    // CASE 2: Scope Extension (AuthZ)
    if ('scopes' in config) {
      return super.openapi(({ onExtendRoute }) => {
        // Late binding: If name is missing, try to find it in dependencies now
        if (!this._securitySchemeName) {
          this.findParentSchemeInDependencies();
        }

        if (!this._securitySchemeName) {
          console.warn('Guard defined scopes but has no parent Security Scheme. Did you forget .after(authnGuard)?');
          return;
        }

        const schemeName = this._securitySchemeName;
        const requiredScopes = config.scopes;

        onExtendRoute((routeConfig) => {
          routeConfig.security = routeConfig.security ?? [];

          const existing = routeConfig.security.find((sec) => schemeName in sec);

          if (existing) {
            const current = existing[schemeName] ?? [];
            existing[schemeName] = Array.from(new Set([...current, ...requiredScopes]));
          } else {
            routeConfig.security.push({ [schemeName]: requiredScopes });
          }

          return routeConfig;
        });
      });
    }

    return this;
  }

  /**
   * Returns the OpenAPI params used to configure this guard, if any.
   */
  public get params(): GuardParams | undefined {
    return this._openapiParams;
  }

  /**
   * Returns the security scheme name associated with this guard.
   */
  public get schemeName(): string | undefined {
    return this._securitySchemeName;
  }

  /**
   * Iterates through dependencies to find a parent Guard with a registered scheme.
   */
  private findParentSchemeInDependencies() {
    for (const dep of this.dependencies) {
      this.tryInheritScheme(dep);
      if (this._securitySchemeName) break;
    }
  }

  /**
   * Attempts to extract the security scheme name from a potential parent Guard.
   */
  private tryInheritScheme(parent: RequestInterceptor) {
    if (isGuard(parent) && parent.schemeName) {
      this._securitySchemeName = parent.schemeName;
      // Optionally inherit the full params if needed for logic
      if (!this._openapiParams && parent.params) {
        this._openapiParams = parent.params;
      }
    }
  }
}

/**
 * Type guard to check if a value is a Guard instance.
 */
export function isGuard<S extends ZodType = ZodVoid>(value: unknown): value is Guard<S> {
  return value instanceof Guard;
}