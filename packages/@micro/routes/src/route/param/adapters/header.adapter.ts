import type { Request } from '../../../http/index.js';
import type { RouteParam } from '../../../route/index.js';
import type {
  AdapterType,
  RouteParamAdapter,
} from './adapter.type.js';

// ----------------------
// Adapter for 'header' parameters
// ----------------------
export function createHeaderAdapter<T>(
  adapterType: AdapterType,
): RouteParamAdapter<T> {
  switch (adapterType) {
  case 'first':
  default:
    return (function (this: RouteParam<T, 'header'>, req: Request, kind, elevate): T {
      let value: string | null;
      for (let name of this.names) {
        value = req.headers.get(name);
        if (value) break;
      }

      if (kind === 'raw') return value! as T;

      const elevatedValue = elevate ? elevate(value!) : value!;
      if (kind === 'elevated') return value! as T;

      return this.schema.parse(elevatedValue);
    }) as RouteParamAdapter<T, 'first'>;

  case 'last':
    return (function (this: RouteParam<T, 'header'>, req: Request, kind, elevate): T {
      let values: string[];
      for (let name of this.names) {
        values = req.headers.getAll(name);
        if (!!values?.length) break;
      }

      const value = values![values!.length - 1];
      if (kind === 'raw') return value! as T;

      const elevatedValue = elevate ? elevate(value!) : value!;
      if (kind === 'elevated') return value! as T;

      return this.schema.parse(elevatedValue);
    }) as RouteParamAdapter<T, 'last'>;

  case 'all':
    return (function (this: RouteParam<T, 'header'>, req: Request, kind, elevate): T {
      let values: string[];
      for (let name of this.names) {
        values = req.headers.getAll(name);
        if (!!values?.length) break;
      }

      if (kind === 'raw') return values! as T;

      const elevatedValues = elevate ? elevate(values!) : values!;
      if (kind === 'elevated') return elevatedValues as T;

      return this.schema.parse(elevatedValues!);
    }) as RouteParamAdapter<T, 'all'>;
  }
}