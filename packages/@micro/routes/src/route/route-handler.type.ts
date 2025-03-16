import type { Request, Response } from '@micro/routes/http';
import type { RouteParams, RouteParamValues } from './param/route-params.type';

export type RouteHandlerArgs<S extends RouteParams> = { req: Request, res: Response, params: RouteParamValues<S> };
export type RouteHandler<S extends RouteParams> = (args: RouteHandlerArgs<S>) => Promise<void> | void;