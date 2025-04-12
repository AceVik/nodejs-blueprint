import { ErrorMiddleware } from './error-middleware.class.js';


export function errorMiddlewares(...errorMiddlewares: (ErrorMiddleware | symbol | string)[]) {
  return errorMiddlewares;
}