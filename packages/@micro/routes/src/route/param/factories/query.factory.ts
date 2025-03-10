import type { ZodSchema } from 'zod';
import type { RouteParam, RouteParamType } from '../route-param.type';
import type { RouteParamAdapterPredicate } from '../adapters';
import { fromParam, firstFromParam, pickFromParam, allFromParam, filterFromParam } from './param.factory';

const sourceType: RouteParamType = 'query';

export function fromQuery<T>(schema: ZodSchema<T>): RouteParam<T>;
export function fromQuery<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function fromQuery<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function fromQuery<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return fromParam(sourceType, nameOrSchema, schema);
}

export function firstFromQuery<T>(schema: ZodSchema<T>): RouteParam<T>;
export function firstFromQuery<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function firstFromQuery<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function firstFromQuery<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return firstFromParam(sourceType, nameOrSchema, schema);
}

export function pickFromQuery<T>(schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromQuery<T>(name: string, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromQuery<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T>;
export function pickFromQuery<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T> {
  return pickFromParam(sourceType, nameOrSchema, schemaOrPredicate, predicate);
}

export function allFromQuery<T>(schema: ZodSchema<T>): RouteParam<T>;
export function allFromQuery<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function allFromQuery<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function allFromQuery<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return allFromParam(sourceType, nameOrSchema, schema);
}

export function filterFromQuery<T>(schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromQuery<T>(name: string, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromQuery<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T>;
export function filterFromQuery<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T> {
  return filterFromParam(sourceType, nameOrSchema, schemaOrPredicate, predicate);
}
