import type { ZodType, ZodVoid } from 'zod';
import type { Request } from '../request/index.js';
import type { Response } from '../response/index.js';
import type { Route } from '../../route/index.js';
import type { Awaitable } from '../../types/index.js';
import { Interceptor } from './interceptor.class.js';
import type { InterceptorContextTools } from './interceptor.types.js';

/**
 * Arguments passed to a RequestInterceptor.
 */
export type RequestInterceptParams<S extends ZodType> = InterceptorContextTools<S> & {
  req: Request;
  res: Response;
  route: Route<never>;
  /**
   * Proceeds to the next interceptor or the route handler.
   */
  next: () => Awaitable<void>;
};

/**
 * Base class for interceptors that run BEFORE the route handler.
 * Used for Authentication, Guards, Logging (Start), and Context Enrichment.
 *
 * @template S - The Zod schema type of the data this interceptor provides.
 */
export abstract class RequestInterceptor<S extends ZodType = ZodVoid> extends Interceptor<S> {
  /**
   * Executes the interceptor logic before the handler.
   *
   * @param params - Execution parameters including request, response, and context tools.
   */
  abstract intercept(params: RequestInterceptParams<S>): Awaitable<void>;
}

/**
 * Type guard to check if a value is a RequestInterceptor.
 * Validates against the class instance and narrows the type to a RequestInterceptor with any valid Zod schema.
 *
 * @param value - The object to check.
 * @returns True if the object is an instance of RequestInterceptor.
 */
export function isRequestInterceptor(value: unknown): value is RequestInterceptor<ZodType> {
  return value instanceof RequestInterceptor;
}