import type { OpenApiExtender } from './types.js';

export abstract class OpenApiBase {
  /**
   * Optional builder function to extend the OpenAPI definition.
   */
  public initOpenapi: OpenApiExtender | undefined;

  /**
   * Registers an OpenAPI extender for this interceptor.
   *
   * @param builder - The function to build/extend the route configuration.
   */
  public openapi(builder: OpenApiExtender): this {
    this.initOpenapi = builder;
    return this;
  }
}