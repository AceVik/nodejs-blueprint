import { z, type ZodType } from 'zod';
import type { RequestMethod } from '../http/index.js';
import type { RouteParams } from './param/route-params.type.js';
import type { RouteInterceptorDefinition } from './route-interceptors.type.js';
import type { ResponseDefinition } from './response-definition.class.js';

/**
 * Defines the allowed HTTP methods for a route.
 * 'ANY' acts as a wildcard.
 */
export type RouteRequestMethod = RequestMethod | 'ANY';

export type Hostname = string;

/**
 * Defines the availability of a route based on hostnames.
 */
export type RouteAvailability = Hostname | Hostname[] | 'all' | 'base' | 'any';

type RouteMetaBase = {
  /**
   * A brief summary of the route.
   */
  summary?: string;

  /**
   * A detailed description of the route.
   */
  description?: string;

  /**
   * Indicates if the route is deprecated.
   */
  deprecated?: boolean;
};

/**
 * Route openapi meta information.
 * Enforces mutually exclusive usage of either `tags` (array) or `tag` (single string).
 */
export type RouteMeta = RouteMetaBase & (
  | {
  /**
   * A list of tags associated with the route.
   * Mutually exclusive with `tag`.
   */
  tags?: string[];
  tag?: never;
}
  | {
  /**
   * A single tag associated with the route.
   * Mutually exclusive with `tags`.
   */
  tag?: string;
  tags?: never;
}
  );

/**
 * Definition for mapping HTTP Status Codes to response definitions.
 * Values can be either a raw Zod Schema or a ResponseDefinition wrapper for metadata.
 * Example: { 200: z.object(...), 404: defineResponse(z.object(...)).description('...') }
 */
export type RouteResponses = Record<number, ZodType<any> | ResponseDefinition<any>>;

/**
 * Utility type to infer the union of all possible return types defined in RouteResponses.
 * Automatically unwraps ResponseDefinition to extract the underlying schema type.
 * Yields `unknown` if R is undefined.
 */
export type InferResponseTypes<R extends RouteResponses | undefined> = R extends RouteResponses
  ? {
    [K in keyof R]: R[K] extends ResponseDefinition<infer S>
      ? z.infer<S>
      : R[K] extends ZodType
        ? z.infer<R[K]>
        : never;
  }[keyof R]
  : unknown;

/**
 * Configuration options for creating a route.
 *
 * @template S - The shape of the route parameters.
 * @template R - The map of allowed response schemas (Status Code -> Zod Schema).
 */
export type RouteOptions<S extends RouteParams, R extends RouteResponses> = {
  /**
   * Available for domains.
   * 'all': available for all given domains.
   * 'base': available only for app but not for any domain.
   * 'any': all and base combined. (default)
   */
  for?: RouteAvailability;

  /**
   * Request method.
   * Auto set by router/importRoutes if not set and auto imported. (Default: 'GET')
   */
  method?: RouteRequestMethod;

  /**
   * Request path.
   * Auto set by router/importRoutes if not set and auto imported.
   * Supports path parameters (e.g., '/users/:id').
   */
  path?: string;

  /**
   * Route params (path, query, headers, cookies).
   * Used for runtime validation and OpenAPI documentation.
   */
  params?: S;

  /**
   * Interceptors to use for this route.
   * Executed in order: Request Interceptors -> Handler -> Response Interceptors.
   * Supports 'omit(interceptor)' to exclude global interceptors.
   */
  use?: ReadonlyArray<RouteInterceptorDefinition>;

  /**
   * Mapping of HTTP Status Codes to Zod Schemas.
   * Defines strict return types for the handler and generates OpenAPI responses.
   */
  responses?: R;
};