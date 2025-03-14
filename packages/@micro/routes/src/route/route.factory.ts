import type { RequestMethod } from '@micro/routes/http';
import type { RouteOptions } from './route-options.type';
import { RouteHandler, type RouteHandlerArgs } from './route-handler.type';
import { Route } from './route.class';

export function route<TParams = RouteHandlerArgs<unknown>>(handler: RouteHandler<TParams>): Route<TParams>;
export function route<TParams = RouteHandlerArgs<unknown>>(options: RouteOptions<TParams>, handler: RouteHandler<TParams>): Route<TParams>;
export function route<TParams = RouteHandlerArgs<unknown>>(
  optionsOrHandler: RouteOptions<TParams> | RouteHandler<TParams>,
  handler?: RouteHandler<TParams>,
): Route<TParams>;
export function route<TParams = RouteHandlerArgs<unknown>>(
  optionsOrHandler: RouteOptions<TParams> | RouteHandler<TParams>,
  handler?: RouteHandler<TParams>,
): Route<TParams> {
  if (typeof optionsOrHandler === 'function') {
    return new Route<TParams>(
      '', // Will be auto set by router if empty
      '', // Will be auto set by router if empty
      '' as RequestMethod, // Will be auto set by router if empty
      optionsOrHandler as RouteHandler<TParams>,
    );
  } else {
    return new Route<TParams>(
      '', // Will be auto set by router if empty
      '', // Will be auto set by router if empty
      optionsOrHandler.method || ('' as RequestMethod), // Will be auto set by router if empty
      handler!,
      optionsOrHandler.params,
    );
  }
}
