import { z, type ZodType } from 'zod';
import type { RouteParamType } from '../route-param-types.type.js';
import {
  type AdapterType,
  type RouteParamAdapter,
  createHeaderAdapter,
  createPathAdapter,
  createQueryAdapter,
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
};

// Internal: Function to create a RouteParam with a specific adapter
function createRouteParamWithHandler<S extends ZodType, AP extends AdapterType>(
  sourceType: RouteParamType,
  adapterType: AP,
  names: string[],
  schema: S,
): RouteParam<z.infer<S>, AP> {
  return createRouteParam<z.infer<S>, AP>(
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
export function fromParam<S extends ZodType>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>>;
/**
 * Creates a RouteParam that reads the first occurrence of a parameter.
 *
 * @param sourceType - The source of the parameter.
 * @param name - The name(s) of the parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function fromParam<S extends ZodType>(
  sourceType: RouteParamType,
  name: string | string[],
  schema: S,
): RouteParam<z.infer<S>>;
export function fromParam<S extends ZodType>(
  sourceType: RouteParamType,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>>;
export function fromParam<S extends ZodType>(
  sourceType: RouteParamType,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>> {
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
export function lastFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>, 'last'>;
/**
 * Creates a RouteParam that reads the last occurrence of a parameter.
 *
 * @param sourceType - The source of the parameter.
 * @param name - The name(s) of the parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function lastFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  name: string | string[],
  schema: S,
): RouteParam<z.infer<S>, 'last'>;
export function lastFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, 'last'>;
export function lastFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, 'last'> {
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
export function allFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>, 'all'>;
/**
 * Creates a RouteParam that reads all occurrences of a parameter as an array.
 *
 * @param sourceType - The source of the parameter.
 * @param name - The name(s) of the parameter.
 * @param schema - The Zod schema.
 * @returns A RouteParam instance.
 */
export function allFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  name: string | string[],
  schema: S,
): RouteParam<z.infer<S>, 'all'>;
export function allFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, 'all'>;
export function allFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  nameOrSchema: string | string[] | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, 'all'> {
  if (typeof nameOrSchema === 'string') {
    return createRouteParamWithHandler(sourceType, 'all', [nameOrSchema], maybeSchema!);
  } else if (Array.isArray(nameOrSchema)) {
    return createRouteParamWithHandler(sourceType, 'all', nameOrSchema, maybeSchema!);
  } else {
    return createRouteParamWithHandler(sourceType, 'all', [], nameOrSchema);
  }
}
