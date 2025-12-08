import { Middleware } from './middleware.class.js';
import type { MiddlewareOpenApiMeta } from './middleware-openapi.types.js';
import type { MiddlewareHandler } from '../middleware.types.js';

let nextMiddlewareId = 0;

export function middleware(name: string | symbol, handler: MiddlewareHandler, openapi?: MiddlewareOpenApiMeta): Middleware;
export function middleware(handler: MiddlewareHandler, openapi?: MiddlewareOpenApiMeta): Middleware;
export function middleware(
  arg1: string | symbol | MiddlewareHandler,
  arg2?: MiddlewareHandler | MiddlewareOpenApiMeta,
  arg3?: MiddlewareOpenApiMeta,
): Middleware {
  let name: string | symbol;
  let handler: MiddlewareHandler;
  let openapi: MiddlewareOpenApiMeta | undefined;

  if (typeof arg1 === 'function') {
    name = `mw-${nextMiddlewareId++}`;
    handler = arg1 as MiddlewareHandler;
    openapi = arg2 as MiddlewareOpenApiMeta | undefined;
  } else {
    name = arg1 as string | symbol;
    handler = arg2 as MiddlewareHandler;
    openapi = arg3 as MiddlewareOpenApiMeta | undefined;
  }

  return new Middleware(name, handler, openapi);
}
