import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import { fromParam } from './param.factory.js';

const sourceType = 'path';

/**
 * Creates a RouteParam that reads a path parameter.
 *
 * @param schema - The Zod schema for validation.
 * @returns A RouteParam instance typed for path parameters.
 */
export function fromPath<S extends ZodType>(schema: S): RouteParam<z.infer<S>, 'path'>;

/**
 * Creates a RouteParam that reads a path parameter.
 *
 * @param name - The name(s) of the path parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance typed for path parameters.
 */
export function fromPath<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>, 'path'>;

export function fromPath<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'path'>;

export function fromPath<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>, 'path'> {
  return fromParam<S, 'path'>(sourceType, nameOrSchema, schema);
}