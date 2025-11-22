import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import type { RouteParamType } from '../route-param-types.type.js';
import { fromParam, lastFromParam, allFromParam } from './param.factory.js';

const sourceType: RouteParamType = 'header';

/**
 * Creates a RouteParam that reads the first occurrence of a header.
 *
 * @param schema - The Zod schema for validation.
 * @returns A RouteParam instance.
 */
export function fromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>>;
/**
 * Creates a RouteParam that reads the first occurrence of a header.
 *
 * @param name - The name(s) of the header.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function fromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>>;
export function fromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>>;
export function fromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads the last occurrence of a header.
 *
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function lastFromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'last'>;
/**
 * Creates a RouteParam that reads the last occurrence of a header.
 *
 * @param name - The name(s) of the header.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function lastFromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'last'>;
export function lastFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'last'> {
  return lastFromParam(sourceType, nameOrSchema, schema);
}

/**
 * Creates a RouteParam that reads all occurrences of a header as an array.
 *
 * @param schema - The Zod schema (must be an array schema).
 * @returns A RouteParam instance.
 */
export function allFromHeader<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'all'>;
/**
 * Creates a RouteParam that reads all occurrences of a header as an array.
 *
 * @param name - The name(s) of the header.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function allFromHeader<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'all'>;
export function allFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'all'>;
export function allFromHeader<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'all'> {
  return allFromParam(sourceType, nameOrSchema, schema);
}
