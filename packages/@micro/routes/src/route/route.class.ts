import { ZodError } from 'zod';
import type { Request, Response } from '../http/index.js';
import type { RouteHandler, RouteHandlerArgs } from './route-handler.type.js';
import type { RouteParams, RouteParamValues } from './param/route-params.type.js';
import {
  BadRequestError,
} from '../http/index.js';
import { RoutesApp } from '../server/index.js';
import type { RouteRequestMethod } from './route-options.type.js';

export class Route<S extends RouteParams> {
  public exec: RouteHandler<S>;
  private paramKeys: string[];

  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly method: RouteRequestMethod ,
    handler: RouteHandler<S>,
    public readonly params?: S,
  ) {
    this.exec = handler;
    // Cache keys for performance (params are static per route)
    this.paramKeys = this.params ? Object.keys(this.params) : [];
  }

  private extractParams(req: Request) {
    const errors: any[] = [];
    const params: Record<string, unknown> = {};
    for (const key of this.paramKeys) {
      try {
        params[key] = this.params![key]!.getValue(req);
      } catch (e) {
        if (e instanceof ZodError) {
          const rawValue = this.params![key]!.getRawValue(req);
          const elevatedValue = this.params![key]!.getElevatedValue(req);
          errors.push({
            message: `Invalid ${this.params![key]!.type} parameter ${key}`,
            name: key,
            type: this.params![key]!.type,
            readType: this.params![key]!.readType,
            values: {
              raw: rawValue,
              elevated: elevatedValue,
            },
            issues: e.issues || e.errors,
          });
        } else {
          throw e;
        }
      }
    }
    return {
      params: params as RouteParamValues<S>,
      errors,
    };
  }

  /**
   * Handles an incoming request.
   * Optimized for performance by minimizing per-request overhead.
   */
  public async handleRequest(req:Request, res: Response, app: RoutesApp, onAborted: (handler: () => void) => void) {
    const { params, errors: paramErrors } = this.extractParams(req);
    if (paramErrors.length > 0) {
      throw new BadRequestError('Invalid request parameters', paramErrors);
    }

    const routeHandlerArgs = {
      app,
      req,
      res,
      onAborted,
      params,
    } satisfies RouteHandlerArgs<S>;

    await this.exec(routeHandlerArgs);
  }
}
