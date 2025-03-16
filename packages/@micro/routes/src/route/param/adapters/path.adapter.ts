import type { Request } from '../../../http/index.js';
import type { RouteParam } from '../../../route/index.js';
import type {
  AdapterType,
  RouteParamAdapter,
} from './adapter.type.js';

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