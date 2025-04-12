import type { RequestMethod } from '../http/index.js';
import type { RouteParams } from './param/route-params.type.js';
import type { ErrorMiddleware } from '../middleware/index.js';

export type RouteRequestMethod = RequestMethod | 'ANY';

export type RouteOptions<S extends RouteParams> = {
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
   * Route openapi summary
   */
  summary?: string;

  /**
   * Route openapi description
   */
  description?: string;
};