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
    return (function (this: RouteParam<T, 'path'>, req: Request, kind, elevate): T {
      let value: string | null;
      for (let name of this.names) {
        value = req.path.get(name);
        if (value) break;
      }

      const values = [value!];

      if (kind === 'raw') return values! as T;

      const elevatedValue = elevate ? elevate(values!) : values!;
      if (kind === 'elevated') return elevatedValue! as T;

      return this.schema.parse(elevatedValue);
    }) as RouteParamAdapter<T, 'all'>;

  default:
    return (function (this: RouteParam<T, 'path'>, req: Request, kind, elevate): T {
      let value: string | null;
      for (let name of this.names) {
        value = req.path.get(name);
        if (value) break;
      }

      if (kind === 'raw') return value! as T;

      const elevatedValue = elevate ? elevate(value!) : value!;
      if (kind === 'elevated') return elevatedValue! as T;

      return this.schema.parse(elevatedValue);
    }) as RouteParamAdapter<T, 'first'>;
  }
}