import type { ZodType, ZodVoid } from 'zod';
import type { Request } from '../request/index.js';
import type { Response } from '../response/index.js';
import type { Route } from '../../route/index.js';
import type { Awaitable } from '../../types/index.js';
import { Interceptor } from './interceptor.class.js';
import type { InterceptorContextTools } from './interceptor.types.js';

/**
 * Arguments passed to a ResponseInterceptor.
 */
export type ResponseInterceptParams<S extends ZodType, In> = InterceptorContextTools<S> & {
  req: Request;
  res: Response;
  route: Route<never>;
  /**
   * The result returned by the route handler or the previous response interceptor.
   */
  result: In;
};

/**
 * Base class for interceptors that run AFTER the route handler.
 * Used for Response Transformation, Serialization, Wrapping, and Logging (End).
 *
 * @template S - The Zod schema type of the data this interceptor provides (rarely used for response interceptors).
 * @template In - The type of the result data coming into this interceptor.
 * @template Out - The type of the result data returned by this interceptor.
 */
export abstract class ResponseInterceptor<S extends ZodType = ZodVoid, In = unknown, Out = unknown> extends Interceptor<S> {
  /**
   * Executes the interceptor logic after the handler.
   *
   * @param params - Execution parameters including the result from the previous step.
   * @returns The potentially transformed result.
   */
  abstract intercept(params: ResponseInterceptParams<S, In>): Awaitable<Out>;
}

/**
 * Type guard to check if a value is a ResponseInterceptor.
 * Validates against the class instance and narrows the type to a ResponseInterceptor with any valid Zod schema.
 *
 * @param value - The object to check.
 * @returns True if the object is an instance of ResponseInterceptor.
 */
export function isResponseInterceptor(value: unknown): value is ResponseInterceptor<ZodType> {
  return value instanceof ResponseInterceptor;
}