import { ErrorMiddleware } from './error-middleware.class.js';

/**
 * @deprecated
 */
export function errorMiddlewares(...errorMiddlewares: (ErrorMiddleware | symbol | string)[]) {
  return errorMiddlewares;
}