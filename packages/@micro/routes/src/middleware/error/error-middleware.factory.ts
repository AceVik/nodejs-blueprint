import type { ErrorMiddlewareHandler } from './error-middleware-handler.type.js';
import { ErrorMiddleware } from './error-middleware.class.js';

let nextErrorMiddlewareId = 0;

export function errorMiddleware(errorHandler: ErrorMiddlewareHandler): ErrorMiddleware;
export function errorMiddleware(name: string | symbol, errorHandler: ErrorMiddlewareHandler): ErrorMiddleware;
export function errorMiddleware(nameOrErrorHandler: string | symbol | ErrorMiddlewareHandler, errorHandler?: ErrorMiddlewareHandler): ErrorMiddleware;
export function errorMiddleware(nameOrErrorHandler: string | symbol | ErrorMiddlewareHandler, errorHandler?: ErrorMiddlewareHandler): ErrorMiddleware {
  if (typeof nameOrErrorHandler === 'function') {
    return new ErrorMiddleware(`emw-${nextErrorMiddlewareId++}`, nameOrErrorHandler as ErrorMiddlewareHandler);
  }

  return new ErrorMiddleware(nameOrErrorHandler, errorHandler!);
};