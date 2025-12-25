import type { Awaitable } from '../core/index.js';
import type { RoutesApp } from '../server/index.js';
import type { RouteParamValues, RouteParams } from './param/route-params.type.js';
import type { RouteResponses, InferResponseTypes } from './route-options.type.js';
import type { Request, Response, HttpResult } from '../http/index.js';

/**
 * Arguments passed to the route handler.
 */
export type RouteHandlerArgs<S extends RouteParams> = {
  app: RoutesApp;
  req: Request;
  res: Response;
  params: RouteParamValues<S>;
  onAborted: (handler: () => void) => void;
};

/**
 * Helper type: The handler may return the raw type T (which framework wraps in 200 OK)
 * or an explicit HttpResult<T> (for custom status codes/headers).
 */
export type HandlerResult<T> = T | HttpResult<T>;

/**
 * Definition of a route handler function.
 * * @template S - Route Params
 * @template R - Route Responses (mapping of status codes to schemas)
 */
export type RouteHandler<S extends RouteParams, R extends RouteResponses> =
  (args: RouteHandlerArgs<S>) => Awaitable<HandlerResult<InferResponseTypes<R>>>;