import type { MiddlewareOpenApiMeta } from './middleware-openapi.types.js';
import type { MiddlewareHandler } from '../middleware.types.js';

export class Middleware {
  constructor(
    public readonly name: string | symbol,
    public readonly handler: MiddlewareHandler,
    public readonly openapi?: MiddlewareOpenApiMeta,
  ) {}
}
