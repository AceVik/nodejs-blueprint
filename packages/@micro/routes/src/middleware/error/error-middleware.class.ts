import type { ErrorMiddlewareHandler } from './error-middleware-handler.type.js';

export class ErrorMiddleware {
  public readonly handleError: ErrorMiddlewareHandler;
  constructor(public readonly name: string | symbol, handler: ErrorMiddlewareHandler) {
    this.handleError = handler;
  }
}