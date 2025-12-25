import {
  ResponseInterceptor,
  type ResponseInterceptorHandler, type ResultableResponse,
} from './response-interceptor.class.js';

/**
 * Creates a generic ResponseInterceptor from a function.
 * Use this to avoid creating class files for simple logic.
 *
 * @param handler - The function to execute.
 */
export function responseInterceptor<In = ResultableResponse, Out = In>(
  handler: ResponseInterceptorHandler<In, Out>,
): ResponseInterceptor<In, Out> {
  return new ResponseInterceptor(handler);
}