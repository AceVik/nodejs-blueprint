import { ErrorMiddleware } from './error-middleware.class.js';
import type { ErrorMiddlewareHandler } from './error-middleware-handler.type.js';
import type { ErrorResponseSchemas } from './error-middleware.types.js';

let nextErrorMiddlewareId = 0;

/**
 * Creates a new ErrorMiddleware without a specific name (auto-generated ID).
 *
 * @param responses - Map of HTTP status codes to Zod schemas describing the error responses.
 * @param handler - The function to handle the error.
 * @deprecated
 */
export function errorMiddleware(
  responses: ErrorResponseSchemas,
  handler: ErrorMiddlewareHandler
): ErrorMiddleware;

/**
 * Creates a new ErrorMiddleware with a specific name.
 *
 * @param name - Unique name or symbol to identify/override this middleware.
 * @param responses - Map of HTTP status codes to Zod schemas describing the error responses.
 * @param handler - The function to handle the error.
 * @deprecated
 *
 */
export function errorMiddleware(
  name: string | symbol,
  responses: ErrorResponseSchemas,
  handler: ErrorMiddlewareHandler
): ErrorMiddleware;

/**
 * Implementation
 * @deprecated
 */
export function errorMiddleware(
  arg1: string | symbol | ErrorResponseSchemas,
  arg2: ErrorResponseSchemas | ErrorMiddlewareHandler,
  arg3?: ErrorMiddlewareHandler,
): ErrorMiddleware {
  let name: string | symbol;
  let responses: ErrorResponseSchemas;
  let handler: ErrorMiddlewareHandler;

  if (typeof arg1 === 'string' || typeof arg1 === 'symbol') {
    name = arg1;
    responses = arg2 as ErrorResponseSchemas;
    handler = arg3 as ErrorMiddlewareHandler;
  } else {
    name = `emw-${nextErrorMiddlewareId++}`;
    responses = arg1 as ErrorResponseSchemas;
    handler = arg2 as ErrorMiddlewareHandler;
  }

  return new ErrorMiddleware(name, responses, handler);
}