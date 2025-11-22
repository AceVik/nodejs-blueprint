import type { ErrorMiddlewareHandler } from './error-middleware-handler.type.js';

/**
 * Represents an error handling middleware.
 */
export class ErrorMiddleware {
  /**
   * The handler function for the error middleware.
   */
  public readonly handleError: ErrorMiddlewareHandler;

  /**
   * Creates a new ErrorMiddleware instance.
   *
   * @param name - The unique name or symbol of the middleware.
   * @param handler - The function to handle errors.
   */
  constructor(public readonly name: string | symbol, handler: ErrorMiddlewareHandler) {
    this.handleError = handler;
  }
}