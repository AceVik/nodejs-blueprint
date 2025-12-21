import type { ZodType } from 'zod';
import type { Awaitable } from '../core/index.js';
import type { RoutesApp } from '../server/index.js';
import type { Request, RequestInterceptor, Response } from '../http/index.js';
import type { RouteParams, RouteParamValues } from './param/route-params.type.js';

/**
 * Function signature for resolving dependency injection from interceptors.
 */
export type RouteResolver = <T>(interceptor: RequestInterceptor<ZodType<T>>) => T | undefined;

export type OnAborted = (handler: () => void) => void;
export type RouteHandlerArgs<S extends RouteParams> = {
  app: RoutesApp;
  req: Request;
  res: Response;

  /**
   * The validated and typed parameters extracted from the request.
   */
  params: RouteParamValues<S>;

  /**
   * Registers a callback to be executed if the request is aborted/closed prematurely.
   */
  onAborted: OnAborted;

  /**
   * Resolves the value provided by a specific RequestInterceptor (e.g., a Guard).
   * Usage: const user = resolve(authGuard);
   */
  resolve: RouteResolver;
};
/**
 * Definition of a route handler function.
 */
export type RouteHandler<S extends RouteParams> = (args: RouteHandlerArgs<S>) => Awaitable<unknown>;