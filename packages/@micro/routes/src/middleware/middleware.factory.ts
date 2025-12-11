import { Middleware } from './middleware.class.js';
import type { MiddlewareHandler } from './middleware.types.js';

/**
 * Creates a new Middleware instance.
 * Identity is managed by object reference.
 *
 * @param handler - The handler function to execute.
 * @returns A new Middleware instance.
 * @deprecated
 */
export function middleware(handler: MiddlewareHandler): Middleware {
  return new Middleware(handler);
}