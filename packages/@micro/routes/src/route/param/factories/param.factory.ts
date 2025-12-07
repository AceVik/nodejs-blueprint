import { z, type ZodType } from 'zod';
import type { RouteParamType } from '../route-param-types.type.js';
import {
  type AdapterType,
  type RouteParamAdapter,
  createHeaderAdapter,
  createPathAdapter,
  createQueryAdapter,
  createCookieAdapter,
} from '../adapters/index.js';
import { createRouteParam, type RouteParam } from '../route-param.class.js';

// ---------------------------------------------------
// Adapter Builders: one function per parameter source
// ---------------------------------------------------
export const adapterBuilders: Record<
  RouteParamType,
  <T>(adapterType: AdapterType) => RouteParamAdapter<T>
> = {
  path: createPathAdapter,
  query: createQueryAdapter,
  header: createHeaderAdapter,
  cookie: createCookieAdapter,
};

// Internal: Function to create a RouteParam with a specific adapter
function createRouteParamWithHandler<S extends ZodType, PT extends RouteParamType, AP extends AdapterType>(
  sourceType: PT,
  adapterType: AP,
  names: string[],
  schema: S,
): RouteParam<z.infer<S>, PT, AP> {
  return createRouteParam<z.infer<S>, PT, AP>(
    sourceType,
    names,
    schema as unknown as ZodType<z.infer<S>>,
    adapterType,
    adapterBuilders[sourceType]<z.infer<S>>(adapterType),
  );
}


// ---------------------------------------------------
// Factory functions to create a RouteParam with its adapter
// ---------------------------------------------------

// fromParam: Default-Adapter ('first')

/**
 * Creates a RouteParam that reads the first occurrence of a parameter.
 *
 * @param sourceType - The source of the parameter (path, query, header).
 * @param schema - The Zod schema for validation.
 * @returns A RouteParam instance.
 */
export function fromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  schema: S,
): RouteParam<z.infer<S>, PT>;
/**
 * Creates a RouteParam that reads the first occurrence of a parameter.
 *
 * @param sourceType - The source of the parameter.
 * @param name - The name(s) of the parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function fromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  name: string | string[],
  schema: S,
): RouteParam<z.infer<S>, PT>;
export function fromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, PT>;
export function fromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, PT> {
  if (typeof nameOrSchema === 'string') {
    return createRouteParamWithHandler(sourceType, 'first', [nameOrSchema], maybeSchema!);
  } else if (Array.isArray(nameOrSchema)) {
    return createRouteParamWithHandler(sourceType, 'first', nameOrSchema, maybeSchema!);
  } else {
    return createRouteParamWithHandler(sourceType, 'first', [], nameOrSchema);
  }
}

// lastFromParam: Adapter ('last')

/**
 * Creates a RouteParam that reads the last occurrence of a parameter.
 *
 * @param sourceType - The source of the parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function lastFromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  schema: S,
): RouteParam<z.infer<S>, PT, 'last'>;
/**
 * Creates a RouteParam that reads the last occurrence of a parameter.
 *
 * @param sourceType - The source of the parameter.
 * @param name - The name(s) of the parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function lastFromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  name: string | string[],
  schema: S,
): RouteParam<z.infer<S>, PT, 'last'>;
export function lastFromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, PT, 'last'>;
export function lastFromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, PT, 'last'> {
  if (typeof nameOrSchema === 'string') {
    return createRouteParamWithHandler(sourceType, 'last', [nameOrSchema], maybeSchema!);
  } else if (Array.isArray(nameOrSchema)) {
    return createRouteParamWithHandler(sourceType, 'last', nameOrSchema, maybeSchema!);
  } else {
    return createRouteParamWithHandler(sourceType, 'last', [], nameOrSchema);
  }
}

// allFromParam: Adapter ('all')

/**
 * Creates a RouteParam that reads all occurrences of a parameter as an array.
 *
 * @param sourceType - The source of the parameter.
 * @param schema - The Zod schema (must be an array schema).
 * @returns A RouteParam instance.
 */
export function allFromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  schema: S,
): RouteParam<z.infer<S>, PT, 'all'>;
/**
 * Creates a RouteParam that reads all occurrences of a parameter as an array.
 *
 * @param sourceType - The source of the parameter.
 * @param name - The name(s) of the parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function allFromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  name: string | string[],
  schema: S,
): RouteParam<z.infer<S>, PT, 'all'>;
export function allFromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, PT, 'all'>;
export function allFromParam<S extends ZodType, PT extends RouteParamType>(
  sourceType: PT,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, PT, 'all'> {
  if (typeof nameOrSchema === 'string') {
    return createRouteParamWithHandler(sourceType, 'all', [nameOrSchema], maybeSchema!);
  } else if (Array.isArray(nameOrSchema)) {
    return createRouteParamWithHandler(sourceType, 'all', nameOrSchema, maybeSchema!);
  } else {
    return createRouteParamWithHandler(sourceType, 'all', [], nameOrSchema);
  }
}
