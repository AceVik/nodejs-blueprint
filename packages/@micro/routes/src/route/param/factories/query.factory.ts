import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import { fromParam, lastFromParam, allFromParam } from './param.factory.js';

const sourceType = 'query';

/**
 * Creates a RouteParam that reads the first occurrence of a query parameter.
 *
 * @param schema - The Zod schema for validation.
 * @returns A RouteParam instance typed for query parameters.
 */
export function fromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'query'>;

/**
 * Creates a RouteParam that reads the first occurrence of a query parameter.
 *
 * @param name - The name(s) of the query parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for query parameters.
 */
export function fromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'query'>;
export function fromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'query'>;
export function fromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'query'> {
  return fromParam<S, 'query'>(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads the last occurrence of a query parameter.
 *
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for query parameters with 'last' adapter.
 */
export function lastFromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'query', 'last'>;

/**
 * Creates a RouteParam that reads the last occurrence of a query parameter.
 *
 * @param name - The name(s) of the query parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for query parameters with 'last' adapter.
 */
export function lastFromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'query', 'last'>;
export function lastFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'query', 'last'>;
export function lastFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'query', 'last'> {
  return lastFromParam<S, 'query'>(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads all occurrences of a query parameter as an array.
 *
 * @param schema - The Zod schema (must be an array schema).
 * @returns A RouteParam instance typed for query parameters with 'all' adapter.
 */
export function allFromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'query', 'all'>;

/**
 * Creates a RouteParam that reads all occurrences of a query parameter as an array.
 *
 * @param name - The name(s) of the query parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for query parameters with 'all' adapter.
 */
export function allFromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'query', 'all'>;
export function allFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'query', 'all'>;
export function allFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'query', 'all'> {
  return allFromParam<S, 'query'>(sourceType, nameOrSchema, schema);
}