import { RouteParam } from './route-param.class.js';

export type RouteParams = Record<string, RouteParam<unknown, any>>;
export type RouteParamValues<S extends RouteParams> = { [K in keyof S]: ReturnType<S[K]['getValue']> };