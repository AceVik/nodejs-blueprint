import type { RequestMethod } from '@micro/routes/http/index.ts';
import type { RouteParams } from './param/route-params.type.js';


export type RouteOptions<S extends RouteParams> = {
  /**
   * Request method
   * auto set bei router/importRoutes if not set
   */
  method?: RequestMethod;

  /**
   * Route openapi description
   */
  desc?: string;

  /**
   * Route params (path, query, headers, ... - is used for openapi documentation also)
   */
  params?: S;
};