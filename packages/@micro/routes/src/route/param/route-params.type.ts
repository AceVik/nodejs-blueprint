import { RouteParam } from './route-param.class.js';
import type { RouteParamType } from './route-param-types.type.js';
import type { AdapterType } from './adapters/index.js';

export type RouteParams = Record<string, RouteParam<unknown, RouteParamType, AdapterType>>;
export type RouteParamValues<S extends RouteParams> = { [K in keyof S]: ReturnType<S[K]['getValue']> };