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
    return (function(this: RouteParam<T>, req, kind, elevate) {
      let value: string | null;
      for (let name of this.names) {
        value = req.query.get(name);
        if (value) break;
      }

      if (kind === 'raw') return value!;

      const elevatedValue = elevate ? elevate(value!) : value!;
      if (kind === 'elevated') return elevatedValue;

      return this.schema.parse(elevatedValue);
    }) as RouteParamAdapter<T, 'first'>;
  case 'all':
    return (function(this: RouteParam<T, 'all'>, req, kind, elevate): T {
      let values: string[];
      for (let name of this.names) {
        values = req.query.getAll(name);
        if (!!values.length) break;
      }

      if (kind === 'raw') return values! as T;

      const elevatedValues = elevate ? elevate(values!) : values!;
      if (kind === 'elevated') return elevatedValues as T;

      return this.schema.parse(elevatedValues);
    }) as RouteParamAdapter<T, 'all'>;

  case 'last':
    return (function(this: RouteParam<T>, req, kind, elevate): T {
      let values: string[];
      for (let name of this.names) {
        values = req.query.getAll(name);
        if (!!values.length) break;
      }

      const value = values![values!.length - 1];
      if (kind === 'raw') return value as T;

      const elevatedValue = elevate ? elevate(value) : value;
      if (kind === 'elevated') return elevatedValue as T;

      return this.schema.parse(elevatedValue);
    }) as RouteParamAdapter<T, 'last'>;
  }
}