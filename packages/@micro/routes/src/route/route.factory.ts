import type { RequestMethod } from '../http/index.js';
import type { RouteHandler } from './route-handler.type.js';
import type { RouteParams } from './param/route-params.type.js';
import type { RouteOptions } from './route-options.type.js';
import type { RouteParamType } from './param/route-param-types.type.js';
import { Route } from './route.class.js';
import { camelToKebab } from '../utils/camel-to-kebab.util.js';

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
        const param = optionsOrHandler.params[paramName]!;
        if (!param.names.length)
          Object.defineProperty(optionsOrHandler.params[paramName], 'names', {
            value: (['header'] as RouteParamType[]).includes(param.type) ? [camelToKebab(paramName), paramName] : [paramName, camelToKebab(paramName)],
          });
      }

    return new Route(empty, empty, optionsOrHandler.method || emptyRequestMethod, handler!, optionsOrHandler.params);
  }
}
