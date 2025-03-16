import { z, type ZodSchema } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import type { RouteParamType } from '../route-param-types.type.js';
import { fromParam, lastFromParam, allFromParam } from './param.factory.js';

const sourceType: RouteParamType = 'header';

export function fromHeader<S extends ZodSchema<unknown>>(schema: S): RouteParam<z.infer<S>>;
export function fromHeader<S extends ZodSchema<unknown>>(name: string, schema: S): RouteParam<z.infer<S>>;
export function fromHeader<S extends ZodSchema<unknown>>(nameOrSchema: string | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}

export function lastFromHeader<S extends ZodSchema<unknown>>(schema: S): RouteParam<z.infer<S>>;
export function lastFromHeader<S extends ZodSchema<unknown>>(name: string, schema: S): RouteParam<z.infer<S>>;
export function lastFromHeader<S extends ZodSchema<unknown>>(nameOrSchema: string | S, schema?: S): RouteParam<z.infer<S>> {
  return lastFromParam(sourceType, nameOrSchema, schema);
}

export function allFromHeader<S extends ZodSchema<unknown>>(schema: S): RouteParam<z.infer<S>>;
export function allFromHeader<S extends ZodSchema<unknown>>(name: string, schema: S): RouteParam<z.infer<S>>;
export function allFromHeader<S extends ZodSchema<unknown>>(nameOrSchema: string | S, schema?: S): RouteParam<z.infer<S>> {
  return allFromParam(sourceType, nameOrSchema, schema);
}
