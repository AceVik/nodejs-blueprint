import type { Request, Response } from '../http/index.js';
import type { RouteParams, RouteParamValues } from './param/route-params.type.js';
import type { RoutesApp } from '../server/index.js';

export type OnAborted = (handler: () => void) => void;
export type RouteHandlerArgs<S extends RouteParams> = {
  app: RoutesApp,
  req: Request,
  res: Response,
  onAborted: OnAborted,
  params: RouteParamValues<S>
};
export type RouteHandler<S extends RouteParams> = (args: RouteHandlerArgs<S>) => Promise<void> | void;