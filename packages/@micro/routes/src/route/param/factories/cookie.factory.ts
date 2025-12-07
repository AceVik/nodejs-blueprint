import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import { fromParam, lastFromParam, allFromParam } from './param.factory.js';

const sourceType = 'cookie';

/**
 * Creates a RouteParam that reads the first occurrence of a cookie parameter.
 *
 * @param schema - The Zod schema for validation.
 * @returns A RouteParam instance typed for cookie parameters.
 */
export function fromCookie<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'cookie'>;

/**
 * Creates a RouteParam that reads the first occurrence of a cookie parameter.
 *
 * @param name - The name(s) of the cookie.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for cookie parameters.
 */
export function fromCookie<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'cookie'>;
export function fromCookie<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'cookie'>;
export function fromCookie<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'cookie'> {
  return fromParam<S, 'cookie'>(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads the last occurrence of a cookie parameter.
 *
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for cookie parameters with 'last' adapter.
 */
export function lastFromCookie<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'cookie', 'last'>;

/**
 * Creates a RouteParam that reads the last occurrence of a cookie parameter.
 *
 * @param name - The name(s) of the cookie.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for cookie parameters with 'last' adapter.
 */
export function lastFromCookie<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'cookie', 'last'>;
export function lastFromCookie<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'cookie', 'last'>;
export function lastFromCookie<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'cookie', 'last'> {
  return lastFromParam<S, 'cookie'>(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads all occurrences of a cookie parameter as an array.
 *
 * @param schema - The Zod schema (must be an array schema).
 * @returns A RouteParam instance typed for cookie parameters with 'all' adapter.
 */
export function allFromCookie<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'cookie', 'all'>;

/**
 * Creates a RouteParam that reads all occurrences of a cookie parameter as an array.
 *
 * @param name - The name(s) of the cookie.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for cookie parameters with 'all' adapter.
 */
export function allFromCookie<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'cookie', 'all'>;
export function allFromCookie<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'cookie', 'all'>;
export function allFromCookie<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'cookie', 'all'> {
  return allFromParam<S, 'cookie'>(sourceType, nameOrSchema, schema);
}