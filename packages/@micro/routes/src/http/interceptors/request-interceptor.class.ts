import type { ZodType, ZodVoid } from 'zod';
import type { Awaitable } from '../../core/index.js';
import { type InterceptBaseParams, Interceptor } from './interceptor.class.js';

/**
 * Arguments passed to the interceptor handler.
 */
export type RequestInterceptParams = InterceptBaseParams & {
  /**
   * Proceed to the next interceptor or handler.
   */
  next: () => Awaitable<void>;
};

/**
 * The specific function signature for request interceptors.
 */
export type RequestInterceptorHandler = (params: RequestInterceptParams) => Awaitable<void>;

/**
 * Interceptor that runs BEFORE the route handler.
 * Used for Context Creation, Authentication, Guards, Logging, etc.
 *
 * @template S - The Zod schema type of the data this interceptor provides to the ContextContainer.
 */
export class RequestInterceptor<S extends ZodType = ZodVoid> extends Interceptor<RequestInterceptorHandler> {
  /**
   * List of interceptors that must run before this one.
   * Specific to RequestInterceptor to ensure semantic correctness (cannot depend on ResponseInterceptor).
   */
  public readonly dependencies = new Set<RequestInterceptor<any>>();

  /**
   * Schema of the data injected into the context.
   * This is unique to RequestInterceptor (Dependency Injection).
   */
  public readonly output?: S;

  /**
   * Creates a new RequestInterceptor.
   *
   * @param handler - The execution logic.
   * @param output - Optional Zod schema defining what this interceptor provides.
   */
  constructor(
    handler: RequestInterceptorHandler,
    output?: S,
  ) {
    super(handler);
    this.output = output;
  }

  /**
   * Declares that this interceptor depends on another request interceptor.
   * The dependency will be executed before this interceptor.
   */
  public after(parent: RequestInterceptor<any>): this {
    this.dependencies.add(parent);
    return this;
  }
}

/**
 * Type guard to check if a value is a RequestInterceptor.
 */
export function isRequestInterceptor<S extends ZodType = ZodVoid>(value: unknown): value is RequestInterceptor<S> {
  return value instanceof RequestInterceptor;
}