import { OpenApiBase } from '../../openapi/openapi-base.class.js';
import type { Route } from '../../route/index.js';
import type { Request } from '../request/index.js';
import type { Response } from '../response/index.js';

/**
 * Arguments passed to the interceptor handler.
 */
export type InterceptBaseParams = {
  /**
   * The incoming HTTP request wrapper.
   * Provides access to headers, query params, body, and dependency injection container.
   */
  req: Request;

  /**
   * The outgoing HTTP response wrapper.
   * Used to write status, headers, and body to the client.
   */
  res: Response;

  /**
   * The route definition that matched this request.
   * Contains metadata like path, method, and configuration.
   */
  route: Route<never, never>;
};

/**
 * Abstract base class for all interceptors.
 * Enforces that every interceptor holds an execution logic (`intercept`).
 *
 * @template H - The type of the handler function (specific signature).
 */
export abstract class Interceptor<H extends Function> extends OpenApiBase {
  /**
   * Creates a new Interceptor.
   *
   * @param intercept - The execution logic.
   */
  protected constructor(public readonly intercept: H) {
    super();
  }
}

/**
 * Type guard to check if a value is an instance of the base Interceptor class.
 * @param value - The object to check.
 * @returns True if the object is an instance of Interceptor.
 */
export function isInterceptor<H extends Function = Function>(value: unknown): value is Interceptor<H> {
  return value instanceof Interceptor;
}