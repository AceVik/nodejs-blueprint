import type { ZodSchema } from 'zod';
import type { RouteParam, RouteParamType } from '../route-param.type';
import {
  type AdapterType,
  type RouteParamAdapter,
  type RouteParamAdapterPredicate,
  createBodyAdapter,
  createCookieAdapter,
  createHeaderAdapter,
  createPathAdapter,
  createQueryAdapter,
} from '../adapters';

// ---------------------------------------------------
// Adapter Builders: one function per parameter source
// ---------------------------------------------------
export const adapterBuilders: Record<
  RouteParamType,
  <T>(adapterType: AdapterType, predicate?: RouteParamAdapterPredicate<T>) => RouteParamAdapter<T>
> = {
  path: createPathAdapter,
  query: createQueryAdapter,
  header: createHeaderAdapter,
  cookie: createCookieAdapter,
  body: createBodyAdapter,
};


function createRouteParam<T>(
  sourceType: RouteParamType,
  adapterType: AdapterType,
  nameOrSchema: string | ZodSchema<T>,
  schemaOrPredicate?: ZodSchema<T> | RouteParamAdapterPredicate<T>,
  maybePredicate?: RouteParamAdapterPredicate<T>,
): RouteParam<T> {
  const isNamed = typeof nameOrSchema === 'string';
  const name = isNamed ? nameOrSchema : '';
  const schema = isNamed ? (schemaOrPredicate as ZodSchema<T>) : nameOrSchema;
  const predicate = isNamed ? maybePredicate : (schemaOrPredicate as RouteParamAdapterPredicate<T> | undefined);

  const routeParam: RouteParam<T> = {
    type: sourceType,
    name,
    schema,
    adapter: adapterBuilders[sourceType]<T>(adapterType, predicate),
  };

  routeParam.adapter = routeParam.adapter.bind(routeParam);
  return routeParam;
}

// ---------------------------------------------------
// Factory functions to create a RouteParam with its adapter
// ---------------------------------------------------

// fromParam: Default-Adapter ('last')
export function fromParam<T>(sourceType: RouteParamType, schema: ZodSchema<T>): RouteParam<T>
export function fromParam<T>(sourceType: RouteParamType, name: string, schema: ZodSchema<T>): RouteParam<T>;
export function fromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function fromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return createRouteParam(sourceType, 'last', nameOrSchema, schema);
}

// firstFromParam: Adapter ('first')
export function firstFromParam<T>(sourceType: RouteParamType, schema: ZodSchema<T>): RouteParam<T>;
export function firstFromParam<T>(sourceType: RouteParamType, name: string, schema: ZodSchema<T>): RouteParam<T>;
export function firstFromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function firstFromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return createRouteParam(sourceType, 'first', nameOrSchema, schema);
}

// pickFromParam: Adapter ('pick')
export function pickFromParam<T>(sourceType: RouteParamType, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromParam<T>(sourceType: RouteParamType, name: string, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>, predicate?: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function pickFromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>, predicate?: RouteParamAdapterPredicate<T>): RouteParam<T> {
  return createRouteParam(sourceType, 'pick', nameOrSchema, schemaOrPredicate, predicate);
}

// allFromParam: Adapter ('all')
export function allFromParam<T>(sourceType: RouteParamType, schema: ZodSchema<T>): RouteParam<T>;
export function allFromParam<T>(sourceType: RouteParamType, name: string, schema: ZodSchema<T>): RouteParam<T>;
export function allFromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T>;
export function allFromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schema?: ZodSchema<T>): RouteParam<T> {
  return createRouteParam(sourceType, 'all', nameOrSchema, schema);
}

// filterFromParam: Adapter ('filter')
export function filterFromParam<T>(sourceType: RouteParamType, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromParam<T>(sourceType: RouteParamType, name: string, schema: ZodSchema<T>, predicate: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>, predicate?: RouteParamAdapterPredicate<T>): RouteParam<T>;
export function filterFromParam<T>(sourceType: RouteParamType, nameOrSchema: string | ZodSchema<T>, schemaOrPredicate: ZodSchema<T> | RouteParamAdapterPredicate<T>, predicate?: RouteParamAdapterPredicate<T>): RouteParam<T> {
  return createRouteParam(sourceType, 'filter', nameOrSchema, schemaOrPredicate, predicate);
}
