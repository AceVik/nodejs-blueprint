import { z, type ZodSchema } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import type { RouteParamType } from '../route-param-types.type.js';
import { fromParam } from './param.factory.js';

const sourceType: RouteParamType = 'path';

export function fromPath<S extends ZodSchema<unknown>>(schema: S): RouteParam<z.infer<S>>;
export function fromPath<S extends ZodSchema<unknown>>(name: string | string[], schema: S): RouteParam<z.infer<S>>;
export function fromPath<S extends ZodSchema<unknown>>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>>;
export function fromPath<S extends ZodSchema<unknown>>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}
