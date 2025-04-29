import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import type { RouteParamType } from '../route-param-types.type.js';
import { fromParam, lastFromParam, allFromParam } from './param.factory.js';

const sourceType: RouteParamType = 'query';

export function fromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>>;
export function fromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>>;
export function fromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>>;
export function fromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}

export function lastFromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'last'> {
  return lastFromParam(sourceType, nameOrSchema, schema);
}

export function allFromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'all'>;
export function allFromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'all'>;
export function allFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'all'>;
export function allFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'all'> {
  return allFromParam(sourceType, nameOrSchema, schema);
}
