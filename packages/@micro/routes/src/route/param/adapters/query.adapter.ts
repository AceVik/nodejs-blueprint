import type { RouteParam } from '../../../route/index.js';
import type {
  AdapterType,
  RouteParamAdapter,
} from './adapter.type.js';

// ----------------------
// Adapter for 'query' parameters
// ----------------------
export function createQueryAdapter<T, AP extends AdapterType = never>(
  adapterType: AP,
) {
  switch (adapterType) {
  case 'first':
  default:
    return (function(this: RouteParam<T>, req, elevate) {
      const value = req.query.get(this.name);
      return this.schema.parse(elevate ? elevate(value) : value);
    }) as RouteParamAdapter<T, 'first'>;
  case 'all':
    return (function(this: RouteParam<T, 'all'>, req, elevate): T {
      const values = req.query.getAll(this.name);
      return this.schema.parse(elevate ? elevate(values) : values);
    }) as RouteParamAdapter<T, 'all'>;

  case 'last':
    return (function(this: RouteParam<T>, req, elevate): T {
      const values = req.query.getAll(this.name);
      return this.schema.parse(elevate ? elevate(values[values.length - 1]) : values[values.length - 1]);
    }) as RouteParamAdapter<T, 'last'>;
  }
}