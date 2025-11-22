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

// Intern: Funktion, die einen RouteParam mit einem bestimmten Adapter erstellt
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
export function fromParam<S extends ZodType>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>>;
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
export function lastFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>, 'last'>;
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
export function allFromParam<S extends ZodType>(
  sourceType: RouteParamType,
  schema: S,
): RouteParam<z.infer<S>, 'all'>;
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
