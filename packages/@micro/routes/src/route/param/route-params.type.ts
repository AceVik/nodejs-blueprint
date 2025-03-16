import { RouteParam } from './route-param.class';

export type RouteParams = Record<string, RouteParam<unknown>>;
export type RouteParamValues<S extends RouteParams> = { [K in keyof S]: ReturnType<S[K]['getValue']> };