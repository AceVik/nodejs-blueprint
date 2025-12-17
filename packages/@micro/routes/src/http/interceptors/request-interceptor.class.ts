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
 * Request interceptor handler.
 */
export type RequestInterceptorHandler<S extends ZodType = ZodVoid> = (params: RequestInterceptParams<S>) => Awaitable<void>;

/**
 * Base class for interceptors that run BEFORE the route handler.
 */
export class RequestInterceptor<S extends ZodType = ZodVoid> extends Interceptor<S> {
  /**
   * List of interceptors that must run before this one.
   * Used for execution ordering and metadata inheritance.
   */
  public readonly dependencies = new Set<RequestInterceptor<any>>();

  constructor(public readonly intercept: RequestInterceptorHandler<S>) {
    super();
  }

  /**
   * Declares that this interceptor depends on another interceptor.
   * This ensures execution order and, for Guards, inherits configuration context.
   *
   * @param parent - The interceptor that must run before this one.
   */
  public after(parent: RequestInterceptor<any>): this {
    this.dependencies.add(parent);
    return this;
  }
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