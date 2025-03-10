import type { Request } from '@micro/routes/http';
import type { RouteParam } from '@micro/routes/route/param/route-param.type';
import type { RouteParamAdapter } from './adapter.type';

// ----------------------
// Adapter for 'body' parameters
// ----------------------
export function createBodyAdapter<T>(): RouteParamAdapter<T> {
  return function (this: RouteParam<T>, req: Request): T {
    // TODO: Implement
    return this.schema.parse(req.body);
  };
}