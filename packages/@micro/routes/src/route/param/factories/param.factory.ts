import { z, type ZodSchema } from 'zod';
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

// Intern: Funktion, die einen RouteParam mit einem bestimmten Adapter erstellt
function createRouteParamWithHandler<S extends ZodSchema<any>, AP extends AdapterType>(
  sourceType: RouteParamType,
  adapterType: AP,
  name: string,
  schema: S,
): RouteParam<z.infer<S>, AP> {
  return createRouteParam<z.infer<S>, AP>(
    sourceType,
    name,
    schema,
    adapterType,
    adapterBuilders[sourceType]<z.infer<S>>(adapterType),
  );
}


// ---------------------------------------------------
// Factory functions to create a RouteParam with its adapter
// ---------------------------------------------------

// fromParam: Default-Adapter ('first')
export function fromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>>;
export function fromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  name: string,
  schema: S,
): RouteParam<z.infer<S>>;
export function fromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  nameOrSchema: string | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>>;
export function fromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  nameOrSchema: string | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>> {
  if (typeof nameOrSchema === 'string') {
    return createRouteParamWithHandler(sourceType, 'first', nameOrSchema, maybeSchema!);
  } else {
    return createRouteParamWithHandler(sourceType, 'first', '', nameOrSchema);
  }
}

// lastFromParam: Adapter ('last')
export function lastFromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>, 'last'>;
export function lastFromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  name: string,
  schema: S,
): RouteParam<z.infer<S>, 'last'>;
export function lastFromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  nameOrSchema: string | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, 'last'>;
export function lastFromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  nameOrSchema: string | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, 'last'> {
  if (typeof nameOrSchema === 'string') {
    return createRouteParamWithHandler(sourceType, 'last', nameOrSchema, maybeSchema!);
  } else {
    return createRouteParamWithHandler(sourceType, 'last', '', nameOrSchema);
  }
}

// allFromParam: Adapter ('all')
export function allFromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>, 'all'>;
export function allFromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  name: string,
  schema: S,
): RouteParam<z.infer<S>, 'all'>;
export function allFromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  nameOrSchema: string | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, 'all'>;
export function allFromParam<S extends ZodSchema<any>>(
  sourceType: RouteParamType,
  nameOrSchema: string | S,
  maybeSchema?: S,
): RouteParam<z.infer<S>, 'all'> {
  if (typeof nameOrSchema === 'string') {
    return createRouteParamWithHandler(sourceType, 'all', nameOrSchema, maybeSchema!);
  } else {
    return createRouteParamWithHandler(sourceType, 'all', '', nameOrSchema);
  }
}
