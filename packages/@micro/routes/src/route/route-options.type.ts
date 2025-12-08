import type { RequestMethod } from '../http/index.js';
import type { RouteParams } from './param/route-params.type.js';
import type { ErrorMiddleware } from '../middleware/index.js';
import type { PhaseConfig } from '../middleware/normal/middlewares.factory.js';

export type RouteRequestMethod = RequestMethod | 'ANY';

export type Hostname = string;
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

export type RouteOptions<S extends RouteParams> = {
  /**
   * Available for domains.
   * 'all': available for all given domains.
   * 'base': available only for app but not for any domain.
   * 'any': all and base combined. (default)
   */
  for?: RouteAvailability;

  /**
   * Request method
   * auto set bei router/importRoutes if not set
   */
  method?: RouteRequestMethod;

  /**
   * Route params (path, query, headers, ... - is used for openapi documentation also)
   */
  params?: S;

  /**
   * Route error middlewares.
   */
  errorMiddlewares?: Record<string, ErrorMiddleware>;

  /**
   * Normal middlewares executed before the handler.
   * Supports array short form or object form with inherit/omit/use.
   */
  before?: PhaseConfig;

  /**
   * Normal middlewares executed after the handler.
   * Supports array short form or object form with inherit/omit/use.
   */
  after?: PhaseConfig;
};