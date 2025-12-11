import type { ZodType, ZodVoid } from 'zod';
import type { RequestMethod } from '../http/index.js';
import type { RouteHandler } from './route-handler.type.js';
import type { RouteParams } from './param/route-params.type.js';
import type { RouteAvailability, RouteOptions } from './route-options.type.js';
import type { RouteParamType } from './param/route-param-types.type.js';
import { Route } from './route.class.js';
import { camelToKebab } from '../utils/camel-to-kebab.util.js';

const empty = '';
const emptyRequestMethod = empty as RequestMethod;

/**
 * Creates a new route definition.
 *
 * @param handler - The route handler function.
 * @returns A new Route instance.
 */
export function route<S extends RouteParams, R extends ZodType = ZodVoid>(handler: RouteHandler<S>): Route<S, R>;

/**
 * Creates a new route definition with options.
 *
 * @param options - The route options (params, method, availability, use, output).
 * @param handler - The route handler function.
 * @returns A new Route instance.
 */
export function route<S extends RouteParams, R extends ZodType = ZodVoid>(options: RouteOptions<S, R>, handler: RouteHandler<S>): Route<S, R>;
export function route<S extends RouteParams, R extends ZodType = ZodVoid>(optionsOrHandler: RouteOptions<S, R> | RouteHandler<S>, handler?: RouteHandler<S>): Route<S, R>;
export function route<S extends RouteParams, R extends ZodType = ZodVoid>(optionsOrHandler: RouteOptions<S, R> | RouteHandler<S>, handler?: RouteHandler<S>): Route<S, R> {
  let hostnames: RouteAvailability = 'any';

  if (typeof optionsOrHandler === 'function') {
    return new Route(empty, empty, emptyRequestMethod, optionsOrHandler, hostnames);
  } else {
    hostnames = optionsOrHandler.for || hostnames;

    if (optionsOrHandler?.params) {
      for (const paramName in optionsOrHandler.params) {
        const param = optionsOrHandler.params[paramName]!;
        if (!param.names.length) {
          Object.defineProperty(optionsOrHandler.params[paramName], 'names', {
            value: (['header'] as RouteParamType[]).includes(param.type) ? [camelToKebab(paramName), paramName] : [paramName, camelToKebab(paramName)],
          });
        }
      }
    }

    return new Route(
      empty,
      empty,
      optionsOrHandler.method || emptyRequestMethod,
      handler!,
      hostnames,
      optionsOrHandler.params,
      optionsOrHandler.use,
      optionsOrHandler.output,
    );
  }
}