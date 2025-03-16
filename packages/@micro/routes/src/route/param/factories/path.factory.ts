import type { RouteParam } from '../route-param.class';
import type { RouteParamType } from '../route-param-types.type';
import { fromParam } from './param.factory';
import { z, type ZodSchema } from '@micro/routes/zod';

const sourceType: RouteParamType = 'path';

export function fromPath<S extends ZodSchema<unknown>>(schema: S): RouteParam<z.infer<S>>;
export function fromPath<S extends ZodSchema<unknown>>(name: string, schema: S): RouteParam<z.infer<S>>;
export function fromPath<S extends ZodSchema<unknown>>(nameOrSchema: string | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}
