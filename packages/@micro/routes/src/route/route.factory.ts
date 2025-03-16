import type { RequestMethod } from '@micro/routes/http';
import type { RouteHandler } from './route-handler.type';
import type { RouteParams } from './param/route-params.type';
import type { RouteOptions } from './route-options.type';
import { Route } from './route.class';

// Info: Empty stuff will be set by router/importRoutes function
const empty = '';
const emptyRequestMethod = empty as RequestMethod;

export function route<S extends RouteParams>(handler: RouteHandler<S>): Route<S>;
export function route<S extends RouteParams>(options: RouteOptions<S>, handler: RouteHandler<S>): Route<S>;
export function route<S extends RouteParams>(optionsOrHandler: RouteOptions<S> | RouteHandler<S>, handler?: RouteHandler<S>): Route<S>;
export function route<S extends RouteParams>(optionsOrHandler: RouteOptions<S> | RouteHandler<S>, handler?: RouteHandler<S>): Route<S> {
  if (typeof optionsOrHandler === 'function') {
    return new Route(empty, empty, emptyRequestMethod, optionsOrHandler);
  } else {
    return new Route(empty, empty, optionsOrHandler.method || emptyRequestMethod, handler!, optionsOrHandler.params);
  }
}
