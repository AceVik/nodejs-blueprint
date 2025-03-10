import type { ZodSchema } from 'zod';
import type { RouteParam, RouteParamType } from '../route-param.type';
import type { RouteParamAdapterPredicate } from '../adapters';
import { fromParam, firstFromParam, pickFromParam, allFromParam, filterFromParam } from './param.factory';

const sourceType: RouteParamType = 'header';

export function fromHeader<T>(schema: ZodSchema<T>): RouteParam<T>;
export function fromHeader<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function fromHeader<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function fromHeader<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return fromParam(sourceType, nameOrSchema, schema);
}

export function firstFromHeader<T>(schema: ZodSchema<T>): RouteParam<T>;
export function firstFromHeader<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function firstFromHeader<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function firstFromHeader<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return firstFromParam(sourceType, nameOrSchema, schema);
}

export function pickFromHeader<T>(schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromHeader<T>(name: string, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromHeader<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T>;
export function pickFromHeader<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T> {
  return pickFromParam(sourceType, nameOrSchema, schemaOrPredicate, predicate);
}

export function allFromHeader<T>(schema: ZodSchema<T>): RouteParam<T>;
export function allFromHeader<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function allFromHeader<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function allFromHeader<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return allFromParam(sourceType, nameOrSchema, schema);
}

export function filterFromHeader<T>(schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromHeader<T>(name: string, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromHeader<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T>;
export function filterFromHeader<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T> {
  return filterFromParam(sourceType, nameOrSchema, schemaOrPredicate, predicate);
}
