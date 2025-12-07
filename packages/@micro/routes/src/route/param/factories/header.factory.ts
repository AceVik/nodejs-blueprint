import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import { fromParam, lastFromParam, allFromParam } from './param.factory.js';

const sourceType = 'header';

/**
 * Creates a RouteParam that reads the first occurrence of a header.
 *
 * @param schema - The Zod schema for validation.
 * @returns A RouteParam instance typed for header parameters.
 */
export function fromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'header'>;

/**
 * Creates a RouteParam that reads the first occurrence of a header.
 *
 * @param name - The name(s) of the header.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for header parameters.
 */
export function fromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'header'>;
export function fromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'header'>;
export function fromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'header'> {
  return fromParam<S, 'header'>(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads the last occurrence of a header.
 *
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for header parameters with 'last' adapter.
 */
export function lastFromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'header', 'last'>;

/**
 * Creates a RouteParam that reads the last occurrence of a header.
 *
 * @param name - The name(s) of the header.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for header parameters with 'last' adapter.
 */
export function lastFromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'header', 'last'>;
export function lastFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'header', 'last'>;
export function lastFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'header', 'last'> {
  return lastFromParam<S, 'header'>(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads all occurrences of a header as an array.
 *
 * @param schema - The Zod schema (must be an array schema).
 * @returns A RouteParam instance typed for header parameters with 'all' adapter.
 */
export function allFromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'header', 'all'>;

/**
 * Creates a RouteParam that reads all occurrences of a header as an array.
 *
 * @param name - The name(s) of the header.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for header parameters with 'all' adapter.
 */
export function allFromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'header', 'all'>;
export function allFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'header', 'all'>;
export function allFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'header', 'all'> {
  return allFromParam<S, 'header'>(sourceType, nameOrSchema, schema);
}