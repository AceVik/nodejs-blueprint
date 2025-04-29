import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import type { RouteParamType } from '../route-param-types.type.js';
import { fromParam, lastFromParam, allFromParam } from './param.factory.js';

const sourceType: RouteParamType = 'header';

export function fromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>>;
export function fromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>>;
export function fromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>>;
export function fromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}

export function lastFromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'last'> {
  return lastFromParam(sourceType, nameOrSchema, schema);
}

export function allFromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'all'>;
export function allFromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'all'>;
export function allFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'all'>;
export function allFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'all'> {
  return allFromParam(sourceType, nameOrSchema, schema);
}
