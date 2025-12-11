import type { Request, Response } from '../http/index.js';
import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import type { Route } from '../route/index.js';
import { Awaitable } from '../types/index.js';

/**
 * @deprecated
 */
export type NextParams = Record<string, unknown>;
/**
 * @deprecated
 */
export type NextFunction = (params?: NextParams) => Awaitable<void>;
/**
 * @deprecated
 */
export type MiddlewareHandlerArgs = {
  req?: Request | undefined,
  res?: Response | undefined,
  next: NextFunction,
  rawReq: HttpRequest,
  rawRes: HttpResponse,
  route: Route<never>,
  prevParams?: NextParams | undefined;
};

/**
 * @deprecated
 */
export type MiddlewareHandler = (args: MiddlewareHandlerArgs) => Awaitable<void>;