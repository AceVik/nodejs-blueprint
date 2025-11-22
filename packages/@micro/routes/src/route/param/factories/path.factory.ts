import { z, type ZodType } from 'zod';
import type { RouteParam } from '../route-param.class.js';
import type { RouteParamType } from '../route-param-types.type.js';
import { fromParam } from './param.factory.js';

const sourceType: RouteParamType = 'path';

/**
 * Creates a RouteParam that reads a path parameter.
 *
 * @param schema - The Zod schema for validation.
 * @returns A RouteParam instance.
 */
export function fromPath<S extends ZodType>(schema: S): RouteParam<z.infer<S>>;
/**
 * Creates a RouteParam that reads a path parameter.
 *
 * @param name - The name(s) of the path parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function fromPath<S extends ZodType>(name: string | string[], schema: S): RouteParam<z.infer<S>>;
export function fromPath<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>>;
export function fromPath<S extends ZodType>(nameOrSchema: string | string[] | S, schema?: S): RouteParam<z.infer<S>> {
  return fromParam(sourceType, nameOrSchema, schema);
}
