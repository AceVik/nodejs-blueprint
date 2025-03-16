import { z, type ZodSchema } from 'zod';
import type { RouteParam } from '../route-param.class';
import type { RouteParamType } from '../route-param-types.type';
import { fromParam, lastFromParam, allFromParam } from './param.factory';

const sourceType: RouteParamType = 'query';

export function fromQuery<S extends ZodSchema<unknown>>(schema: S): RouteParam<z.infer<S>>;
export function fromQuery<S extends ZodSchema<unknown>>(name: string, schema: S): RouteParam<z.infer<S>>;
export function fromQuery<S extends ZodSchema<unknown>>(nameOrSchema: string | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}

export function lastFromQuery<S extends ZodSchema<unknown>>(schema: S): RouteParam<z.infer<S>>;
export function lastFromQuery<S extends ZodSchema<unknown>>(name: string, schema: S): RouteParam<z.infer<S>>;
export function lastFromQuery<S extends ZodSchema<unknown>>(nameOrSchema: string | S, schema?: S): RouteParam<z.infer<S>> {
  return lastFromParam(sourceType, nameOrSchema, schema);
}

export function allFromQuery<S extends ZodSchema<unknown>>(schema: S): RouteParam<z.infer<S>>;
export function allFromQuery<S extends ZodSchema<unknown>>(name: string, schema: S): RouteParam<z.infer<S>>;
export function allFromQuery<S extends ZodSchema<unknown>>(nameOrSchema: string | S, schema?: S): RouteParam<z.infer<S>> {
  return allFromParam(sourceType, nameOrSchema, schema);
}
