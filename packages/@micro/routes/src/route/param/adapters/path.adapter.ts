import type { Request } from '@micro/routes/http';
import type { RouteParam } from '@micro/routes/route/param/route-param.type';
import type {
  AdapterType,
  RouteParamAdapter,
  RouteParamAdapterPredicate,
} from './adapter.type';
import { applyFilterPredicate, applyPickPredicate, defaultFilterPredicate, defaultPickPredicate } from './helpers';
import { NotImplementedError } from '@micro/routes/http/errors';

// ----------------------
// Adapter for 'path' parameters
// ----------------------
export function createPathAdapter<T>(
  adapterType: AdapterType,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParamAdapter<T> {
  return function (this: RouteParam<T>, req: Request): T | T[] {
    /*
    const paramValue = req.pathParams.get(this.name);
    if (paramValue === undefined) return this.schema.parse(undefined);

    if (Array.isArray(paramValue)) {
      switch (adapterType) {
      case 'last':
        return this.schema.parse(paramValue[paramValue.length - 1]);
      case 'first':
        return this.schema.parse(paramValue[0]);
      case 'pick': {
        const effectivePredicate = (predicate || defaultPickPredicate) as RouteParamAdapterPredicate<T>;
        return applyPickPredicate(paramValue, effectivePredicate, this.schema);
      }
      case 'all':
        return paramValue.map((v) => this.schema.parse(v));
      case 'filter': {
        const effectivePredicate = (predicate || defaultFilterPredicate) as RouteParamAdapterPredicate<T>;
        return applyFilterPredicate(paramValue, effectivePredicate, this.schema);
      }
      default:
        return this.schema.parse(paramValue[paramValue.length - 1]);
      }
    } else {
      if (adapterType === 'all') return [this.schema.parse(paramValue)];
      if (adapterType === 'filter') {
        const effectivePredicate = (predicate || defaultFilterPredicate) as RouteParamAdapterPredicate<T>;
        return applyFilterPredicate([paramValue], effectivePredicate, this.schema);
      }
      return this.schema.parse(paramValue);
    }*/

    throw new NotImplementedError('Path adapter is not implemented');
  };
}