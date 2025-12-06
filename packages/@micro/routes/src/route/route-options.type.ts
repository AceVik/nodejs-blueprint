import type { RequestMethod } from '../http/index.js';
import type { RouteParams } from './param/route-params.type.js';
import type { ErrorMiddleware } from '../middleware/index.js';

export type RouteRequestMethod = RequestMethod | 'ANY';

export type Hostname = string;
export type RouteAvailability = Hostname | Hostname[] | 'all' | 'base' | 'any';

/**
 * Route openapi meta information
 */
export type RouteMeta = {
  /**
   * Route openapi summary
   */
  summary?: string;

  /**
   * Route openapi description
   */
  description?: string;

  /**
   * Route openapi tags
   */
  tags?: string[];

  /**
   * Route is deprecated (for openapi)
   */
  deprecated?: boolean;
};

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
};