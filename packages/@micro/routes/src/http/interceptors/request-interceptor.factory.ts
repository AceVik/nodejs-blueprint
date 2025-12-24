import {
  RequestInterceptor,
  type RequestInterceptorHandler,
} from './request-interceptor.class.js';
import type { ZodType, ZodVoid } from 'zod';

/**
 * Creates a generic RequestInterceptor from a function.
 *
 * @param handler - The function to execute.
 * @param output - Optional Zod schema for context data.
 */
export function requestInterceptor<S extends ZodType = ZodVoid>(
  handler: RequestInterceptorHandler,
  output?: S,
): RequestInterceptor<S> {
  return new RequestInterceptor(handler, output);
}