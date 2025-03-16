import type { Request } from '@micro/routes/http';
import type { RouteParam } from '@micro/routes/route/param';
import type {
  AdapterType,
  RouteParamAdapter,
} from './adapter.type';

// ----------------------
// Adapter for 'header' parameters
// ----------------------
export function createHeaderAdapter<T>(
  adapterType: AdapterType,
): RouteParamAdapter<T> {
  switch (adapterType) {
  case 'first':
  default:
    return function (this: RouteParam<T>, req: Request): T {
      return this.schema.parse(req.headers.get(this.name));
    };

  case 'last':
    return function (this: RouteParam<T>, req: Request): T {
      const values = req.headers.getAll(this.name);
      return this.schema.parse(values[values.length - 1]);
    };

  case 'all':
    return function (this: RouteParam<T>, req: Request): T {
      return this.schema.parse(req.headers.getAll(this.name));
    };
  }
}