import type { Request, Response } from '../http/index.js';
import type { RouteParams, RouteParamValues } from './param/route-params.type.js';

export type RouteHandlerArgs<S extends RouteParams> = { req: Request, res: Response, params: RouteParamValues<S> };
export type RouteHandler<S extends RouteParams> = (args: RouteHandlerArgs<S>) => Promise<void> | void;