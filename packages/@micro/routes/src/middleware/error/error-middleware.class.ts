import type { ErrorMiddlewareHandler } from './error-middleware-handler.type.js';
import type { ErrorResponseSchemas } from './error-middleware.types.js';

/**
 * Represents an error handling middleware containing both execution logic and documentation metadata.
 */
export class ErrorMiddleware {
  /**
   * Creates a new ErrorMiddleware instance.
   *
   * @param name - The unique name or symbol of the middleware for replacement/ordering.
   * @param responses - A map of HTTP status codes to Zod schemas for OpenAPI documentation.
   * @param handleError - The function to execute when an error occurs.
   */
  constructor(
    public readonly name: string | symbol,
    public readonly responses: ErrorResponseSchemas,
    public readonly handleError: ErrorMiddlewareHandler,
  ) {}
}