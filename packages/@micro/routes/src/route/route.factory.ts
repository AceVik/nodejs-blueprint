import type { RequestMethod } from '../http/index.js';
import type { RouteHandler } from './route-handler.type.js';
import type { RouteParams } from './param/route-params.type.js';
import type { RouteOptions } from './route-options.type.js';
import { Route } from './route.class.js';

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
    // Set name for each parameter
    if (optionsOrHandler?.params)
      for (const paramName in optionsOrHandler.params) {
        // No check if param is defined, it should crash if not
        if (!optionsOrHandler.params[paramName]!.name.length)
          Object.defineProperty(optionsOrHandler.params[paramName], 'name', {
            value: paramName,
          });
      }

    return new Route(empty, empty, optionsOrHandler.method || emptyRequestMethod, handler!, optionsOrHandler.params);
  }
}
