import type { Request } from '../../../http/index.js';
import type { RouteParam } from '../../../route/index.js';
import type {
  AdapterType,
  RouteParamAdapter,
} from './adapter.type.js';

// ----------------------
// Adapter for 'cookie' parameters
// ----------------------
export function createCookieAdapter<T, AP extends AdapterType = never>(
  adapterType: AP,
) {
  switch (adapterType) {
  case 'all':
    return (function (this: RouteParam<T, 'cookie', 'all'>, req: Request, kind, elevate): T {
      let value: string | null = null;

      for (const name of this.names) {
        value = req.cookies.get(name);
        if (value !== null) break;
      }

      // Cookies via the handler are single-value per key, so 'all' wraps the found value in an array.
      const values = value !== null ? [value] : [];

      if (kind === 'raw') return values as unknown as T;

      const elevated = elevate ? elevate(values) : values;
      if (kind === 'elevated') return elevated as unknown as T;

      return this.schema.parse(elevated);
    }) as RouteParamAdapter<T, 'all'>;

  case 'last':
    return (function (this: RouteParam<T, 'cookie', 'last'>, req: Request, kind, elevate): T {
      let value: string | null = null;

      for (const name of this.names) {
        value = req.cookies.get(name);
        if (value !== null) break;
      }

      if (kind === 'raw') return (value ?? null) as unknown as T;

      const elevated = elevate ? elevate(value ?? null) : (value ?? null);
      if (kind === 'elevated') return elevated as unknown as T;

      return this.schema.parse(elevated);
    }) as RouteParamAdapter<T, 'last'>;

  case 'first':
  default:
    return (function (this: RouteParam<T, 'cookie', 'first'>, req: Request, kind, elevate): T {
      let value: string | null = null;

      for (const name of this.names) {
        value = req.cookies.get(name);
        if (value !== null) break;
      }

      if (kind === 'raw') return (value ?? null) as unknown as T;

      const elevated = elevate ? elevate(value ?? null) : (value ?? null);
      if (kind === 'elevated') return elevated as unknown as T;

      return this.schema.parse(elevated);
    }) as RouteParamAdapter<T, 'first'>;
  }
}