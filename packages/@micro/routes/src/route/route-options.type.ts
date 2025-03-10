import type { RequestMethod } from '@micro/routes/http';
import type { RouteParam } from './param';

export type RouteOptions<TParams> = {
  method?: RequestMethod;
  desc?: string; // OpenAPI summary
  params?: Record<keyof TParams, RouteParam<unknown>>;
  // TODO: To be extended
};