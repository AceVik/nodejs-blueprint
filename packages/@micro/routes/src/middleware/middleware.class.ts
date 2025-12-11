import type { MiddlewareHandler } from './middleware.types.js';
import type { OpenAPIRegistry, RouteConfig } from '@asteasolutions/zod-to-openapi';

/**
 * @deprecated
 */
export type OpenApiRouteExtender = (config: RouteConfig) => RouteConfig;
/**
 * @deprecated
 */
export type OpenApiBuilder = (onExtendRoute: (extender: OpenApiRouteExtender) => void , registry: OpenAPIRegistry) => void;

/**
 * @deprecated
 */
export class Middleware {
  protected readonly _dependsOn: Middleware[] = [];

  public initOpenapi: OpenApiBuilder | undefined;

  constructor(
    public readonly exec: MiddlewareHandler,
  ) {}

  public after(middleware: Middleware): this {
    this._dependsOn.push(middleware);
    return this;
  }

  public openapi(builder: OpenApiBuilder): this {
    this.initOpenapi = builder;
    return this;
  }
}