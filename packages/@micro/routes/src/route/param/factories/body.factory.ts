import type { ZodSchema } from 'zod';
import type { RouteParam, RouteParamType } from '../route-param.type';
import { fromParam } from './param.factory';

const sourceType: RouteParamType = 'body';

export function fromBody<T>(schema: ZodSchema<T>): RouteParam<T>;
export function fromBody<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function fromBody<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function fromBody<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return fromParam(sourceType, nameOrSchema, schema);
}
