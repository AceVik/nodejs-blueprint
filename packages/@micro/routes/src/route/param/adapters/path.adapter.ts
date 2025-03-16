import type { Request } from '@micro/routes/http';
import type { RouteParam } from '@micro/routes/route/param';
import type {
  AdapterType,
  RouteParamAdapter,
} from './adapter.type';

// ----------------------
// Adapter for 'path' parameters
// ----------------------
export function createPathAdapter<T>(
  adapterType: AdapterType,
): RouteParamAdapter<T> {
  switch (adapterType) {
  case 'all':
    return function (this: RouteParam<T>, req: Request): T {
      return this.schema.parse([req.path.get(this.name)]);
    };

  default:
    return function (this: RouteParam<T>, req: Request): T {
      return this.schema.parse(req.path.get(this.name));
    };
  }
}