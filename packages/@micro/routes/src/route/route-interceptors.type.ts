import type { OmitInterceptor, RequestInterceptor, ResponseInterceptor } from '../http/index.js';


/**
 * Defines what can be passed to route.use() or app.use().
 */
export type RouteInterceptorDefinition =
  | RequestInterceptor<any>
  | ResponseInterceptor<any, any>
  | OmitInterceptor;