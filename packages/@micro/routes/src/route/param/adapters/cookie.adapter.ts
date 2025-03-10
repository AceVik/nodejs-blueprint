import type { Request } from '@micro/routes/http';
import type { RouteParam } from '@micro/routes/route/param/route-param.type';
import type {
  AdapterType,
  RouteParamAdapter,
  RouteParamAdapterPredicate,
} from './adapter.type';

// ----------------------
// Adapter for 'cookie' parameters
// ----------------------
export function createCookieAdapter<T>(
  _adapterType: AdapterType,
  _predicate?: RouteParamAdapterPredicate<T>,
): RouteParamAdapter<T> {
  return function (this: RouteParam<T>, req: Request): T {
    const paramValue = req.cookies.get(this.name);
    return this.schema.parse(paramValue);
  };
}