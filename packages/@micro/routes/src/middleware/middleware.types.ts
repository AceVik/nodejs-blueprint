import type { Request, Response } from '../http/index.js';
import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import type { Route } from '../route/index.js';

export type NextParams = Record<string, unknown>;
export type NextFunction = (params?: NextParams) => void;
export type MiddlewareHandlerArgs = {
  req?: Request | undefined,
  res?: Response | undefined,
  next: NextFunction,
  rawReq: HttpRequest,
  rawRes: HttpResponse,
  route: Route<never>,
  prevParams?: NextParams | undefined;
};

export type MiddlewareHandler = (args: MiddlewareHandlerArgs) => void | Promise<void>;