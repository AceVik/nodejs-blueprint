import type { ZodSchema } from 'zod';
import type { RouteParam, RouteParamType } from '../route-param.type';
import type { RouteParamAdapterPredicate } from '../adapters';
import { fromParam, firstFromParam, pickFromParam, allFromParam, filterFromParam } from './param.factory';

const sourceType: RouteParamType = 'path';

export function fromPath<T>(schema: ZodSchema<T>): RouteParam<T>;
export function fromPath<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function fromPath<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function fromPath<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return fromParam(sourceType, nameOrSchema, schema);
}

export function firstFromPath<T>(schema: ZodSchema<T>): RouteParam<T>;
export function firstFromPath<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function firstFromPath<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function firstFromPath<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return firstFromParam(sourceType, nameOrSchema, schema);
}

export function pickFromPath<T>(schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromPath<T>(name: string, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromPath<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T>;
export function pickFromPath<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T> {
  return pickFromParam(sourceType, nameOrSchema, schemaOrPredicate, predicate);
}

export function allFromPath<T>(schema: ZodSchema<T>): RouteParam<T>;
export function allFromPath<T>(name: string, schema: ZodSchema<T>): RouteParam<T>;
export function allFromPath<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function allFromPath<T>(nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return allFromParam(sourceType, nameOrSchema, schema);
}

export function filterFromPath<T>(schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromPath<T>(name: string, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromPath<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T>;
export function filterFromPath<T>(
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  predicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T> {
  return filterFromParam(sourceType, nameOrSchema, schemaOrPredicate, predicate);
}
