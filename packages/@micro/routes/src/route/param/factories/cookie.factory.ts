import type { ZodSchema } from 'zod';
import type { RouteParam, RouteParamType } from '../route-param.type';
import { fromParam } from './param.factory';

const sourceType: RouteParamType = 'cookie';

export function fromCookie<T>(schema: ZodSchema<T>): RouteParam<T>;
export function fromCookie<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function fromCookie<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function fromCookie<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return fromParam(sourceType, nameOrSchema, schema);
}
