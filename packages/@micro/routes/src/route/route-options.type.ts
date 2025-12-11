import type { ZodType, ZodVoid } from 'zod';
import type { RequestMethod } from '../http/index.js';
import type { RouteParams } from './param/route-params.type.js';
import type { ErrorMiddleware } from '../middleware/index.js';
import type { RouteInterceptorDefinitions } from './route-interceptors.type.js';

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
 * Configuration options for creating a route.
 *
 * @template S - The shape of the route parameters.
 * @template R - The Zod schema for the response output.
 */
export type RouteOptions<S extends RouteParams, R extends ZodType = ZodVoid> = {
  /**
   * Available for domains.
   * 'all': available for all given domains.
   * 'base': available only for app but not for any domain.
   * 'any': all and base combined. (default)
   */
  for?: RouteAvailability;

  /**
   * Request method.
   * Auto set by router/importRoutes if not set.
   */
  method?: RouteRequestMethod;

  /**
   * Route params (path, query, headers, cookies).
   * Used for runtime validation and OpenAPI documentation.
   */
  params?: S;

  /**
   * Route error middlewares.
   */
  errorMiddlewares?: Record<string, ErrorMiddleware>;

  /**
   * Interceptors to use for this route.
   * Executed in order: Request Interceptors -> Handler -> Response Interceptors.
   * Supports 'omit(interceptor)' to exclude global interceptors.
   */
  use?: RouteInterceptorDefinitions;

  /**
   * Optional Zod schema to validate and type the response output.
   */
  output?: R;
};