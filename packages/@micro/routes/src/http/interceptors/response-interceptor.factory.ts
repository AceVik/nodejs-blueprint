import {
  ResponseInterceptor,
  type ResponseInterceptorHandler,
} from './response-interceptor.class.js';
import type { Resultable } from '../../core/index.js';

/**
 * Creates a generic ResponseInterceptor from a function.
 * Use this to avoid creating class files for simple logic.
 *
 * @param handler - The function to execute.
 */
export function responseInterceptor<In = Resultable, Out = Resultable>(
  handler: ResponseInterceptorHandler<In, Out>,
): ResponseInterceptor<In, Out> {
  return new ResponseInterceptor(handler);
}