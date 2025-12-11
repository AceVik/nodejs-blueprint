import type { RouteParam } from './route-param.class.js';
import type { RouteParamType } from './route-param-types.type.js';
import type { AdapterType } from './adapters/index.js';

/**
 * Defines the shape of the parameters object for a route.
 * keys are the parameter names, values are the RouteParam definitions.
 *
 * We use 'any' for the generics to allow covariance.
 * This ensures that a RouteParam with a specific type (e.g., string)
 * is assignable to this generic definition required by RouteOptions.
 */
export type RouteParams = Record<string, RouteParam<any, RouteParamType, AdapterType>>;

/**
 * Extracts the values from the RouteParams definition.
 */
export type RouteParamValues<S extends RouteParams> = {
  [K in keyof S]: S[K] extends RouteParam<infer T, any, any> ? T : never;
};