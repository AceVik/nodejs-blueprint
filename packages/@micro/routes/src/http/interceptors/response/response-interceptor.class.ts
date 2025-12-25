import { Awaitable, Result, Resultable } from '../../../core/index.js';
import { type InterceptBaseParams, Interceptor } from '../interceptor.class.js';
import { HttpResult } from '../../result/index.js';

export type ResultableResponse = Resultable | Result<Resultable> | HttpResult<Resultable>;

/**
 * Arguments passed to a ResponseInterceptor.
 */
export type ResponseInterceptParams<In = ResultableResponse> = InterceptBaseParams & {
  /**
   * The result returned by the route handler or the previous response interceptor.
   * Can be modified, replaced, or returned as-is.
   */
  result: In | null;
};

/**
 * The specific function signature for response interceptors.
 * Must return the transformed result (or Promise thereof).
 */
export type ResponseInterceptorHandler<In = ResultableResponse, Out = In> =
  (params: ResponseInterceptParams<In>) => Awaitable<Out>;

/**
 * Interceptor that runs AFTER the route handler.
 * Used for Response Transformation, Serialization, Wrapping, and Logging.
 *
 * @template In - The type of the result data coming into this interceptor.
 * @template Out - The type of the result data returned by this interceptor.
 */
export class ResponseInterceptor<In = ResultableResponse, Out = In>
  extends Interceptor<ResponseInterceptorHandler<In, Out>>
{
  /**
   * List of interceptors that must run before this one.
   * Specific to ResponseInterceptor to ensure semantic correctness.
   */
  public readonly dependencies = new Set<ResponseInterceptor<any, any>>();

  /**
   * Creates a new ResponseInterceptor.
   *
   * @param handler - The execution logic (transforming In to Out).
   */
  constructor(handler: ResponseInterceptorHandler<In, Out>) {
    super(handler);
  }

  /**
   * Declares that this interceptor depends on another response interceptor.
   * The dependency will be executed before this interceptor.
   */
  public after(dependency: ResponseInterceptor<any, any>): this {
    this.dependencies.add(dependency);
    return this;
  }
}

/**
 * Type guard to check if a value is a ResponseInterceptor.
 * Allows explicitly specifying expected In/Out types for stricter checks if needed.
 */
export function isResponseInterceptor<In = ResultableResponse, Out = In>(
  value: unknown,
): value is ResponseInterceptor<In, Out> {
  return value instanceof ResponseInterceptor;
}