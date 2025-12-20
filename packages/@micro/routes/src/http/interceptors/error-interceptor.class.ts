import type { Awaitable } from '../../types/index.js';
import type { Request } from '../request/index.js';
import type { Response } from '../response/index.js';
import type { Route } from '../../route/index.js';
import { Interceptor } from './interceptor.class.js';
import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { ZodType, ZodVoid } from 'zod';

/**
 * ErrorInterceptor is a placeholder base for error-phase interceptors.
 * It participates in the same typed context mechanism as other interceptors
 * via the shared Request lifecycle context. Execution wiring is added separately.
 */
export type ErrorInterceptParams = {
  error: unknown;
  req?: Request;
  res?: Response;
  rawReq: HttpRequest;
  rawRes: HttpResponse;
  route: Route<never>;
  /**
   * Proceeds to the next error interceptor in the chain.
   */
  next: () => Awaitable<void>;
};

export type ErrorInterceptorHandler = (params: ErrorInterceptParams) => Awaitable<void>;

export class ErrorInterceptor<S extends ZodType = ZodVoid> extends Interceptor<S> {
  constructor(public readonly intercept: ErrorInterceptorHandler) {
    super();
  }
}

export function isErrorInterceptor(value: unknown): value is ErrorInterceptor {
  return value instanceof ErrorInterceptor;
}
