import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import type { RouteParamType } from '../route-param-types.type.js';
import { fromParam, lastFromParam, allFromParam } from './param.factory.js';

const sourceType: RouteParamType = 'query';

/**
 * Creates a RouteParam that reads the first occurrence of a query parameter.
 *
 * @param schema - The Zod schema for validation.
 * @returns A RouteParam instance.
 */
export function fromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>>;
/**
 * Creates a RouteParam that reads the first occurrence of a query parameter.
 *
 * @param name - The name(s) of the query parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function fromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>>;
export function fromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>>;
export function fromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads the last occurrence of a query parameter.
 *
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function lastFromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'last'>;
/**
 * Creates a RouteParam that reads the last occurrence of a query parameter.
 *
 * @param name - The name(s) of the query parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function lastFromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'last'> {
  return lastFromParam(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads all occurrences of a query parameter as an array.
 *
 * @param schema - The Zod schema (must be an array schema).
 * @returns A RouteParam instance.
 */
export function allFromQuery<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'all'>;
/**
 * Creates a RouteParam that reads all occurrences of a query parameter as an array.
 *
 * @param name - The name(s) of the query parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function allFromQuery<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'all'>;
export function allFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'all'>;
export function allFromQuery<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'all'> {
  return allFromParam(sourceType, nameOrSchema, schema);
}
