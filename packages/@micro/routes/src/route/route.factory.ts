import type { ZodType } from 'zod';
import type { RequestMethod } from '../http/index.js';
import type { RouteHandler } from './route-handler.type.js';
import type { RouteParams } from './param/route-params.type.js';
import type { RouteAvailability, RouteOptions, RouteResponses } from './route-options.type.js';
import type { RouteParamType } from './param/route-param-types.type.js';
import { Route } from './route.class.js';
import { camelToKebab } from '../core/index.js';

const empty = '';
const emptyRequestMethod = empty as RequestMethod;

// Helper type for empty params to aid inference and avoid TS2742
type EmptyParams = Record<never, never>;

// Default Responses: If nothing is defined, allow any return type (fallback)
type DefaultResponses = Record<number, ZodType<any>>;

/**
 * Creates a new route definition with options.
 * Infers RouteResponses (R) from options.responses automatically.
 *
 * @param options - The route options (params, responses, method, etc.).
 * @param handler - The route handler function.
 * @returns A new Route instance.
 */
export function route<
  S extends RouteParams,
  R extends RouteResponses = DefaultResponses
>(
  options: RouteOptions<S, R>,
  handler: RouteHandler<S, R>
): Route<S, R>;

/**
 * Creates a new route definition without options (just a handler).
 * Infers params as empty and responses as default/any.
 *
 * @param handler - The route handler function.
 * @returns A new Route instance with empty params.
 */
export function route(
  handler: RouteHandler<EmptyParams, DefaultResponses>
): Route<EmptyParams, DefaultResponses>;

// Implementation
export function route<S extends RouteParams, R extends RouteResponses>(
  optionsOrHandler: RouteOptions<S, R> | RouteHandler<S, R>,
  handler?: RouteHandler<S, R>,
): Route<S, R> {
  let hostnames: RouteAvailability = 'any';

  // Case 1: Just Handler (Empty Params)
  if (typeof optionsOrHandler === 'function') {
    // Cast strict EmptyParams to generic S to satisfy return type structure
    return new Route(
      empty,
      empty,
      emptyRequestMethod,
      optionsOrHandler,
      hostnames,
    ) as unknown as Route<S, R>;
  }

  // Case 2: Options + Handler
  else {
    hostnames = optionsOrHandler.for || hostnames;

    // Normalize param names (camelCase key -> kebab-case header/query param)
    if (optionsOrHandler?.params) {
      for (const paramName in optionsOrHandler.params) {
        const param = optionsOrHandler.params[paramName]!;
        if (!param.names.length) {
          const isHeader = (['header'] as RouteParamType[]).includes(param.type);

          Object.defineProperty(param, 'names', {
            value: isHeader ? [camelToKebab(paramName), paramName] : [paramName, camelToKebab(paramName)],
            configurable: true,
            enumerable: true,
            writable: true,
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
      // Pass the responses map instead of the old 'output' schema
      optionsOrHandler.responses,
    );
  }
}