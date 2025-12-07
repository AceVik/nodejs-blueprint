import { ZodError } from 'zod';
import type { Request, Response } from '../http/index.js';
import type { RouteHandler, RouteHandlerArgs } from './route-handler.type.js';
import type { RouteParams, RouteParamValues } from './param/route-params.type.js';
import {
  BadRequestError,
} from '../http/index.js';
import { RoutesApp } from '../server/index.js';
import { type RouteAvailability, RouteMeta, type RouteRequestMethod } from './route-options.type.js';
import { type HttpErrorErrors } from '../http/errors/http-error-errors.type.js';

/**
 * Represents a defined route within the application.
 * Handles request execution, parameter extraction, and validation.
 *
 * @template S - The shape of the route parameters.
 */
export class Route<S extends RouteParams> {
  /**
   * The function to execute when this route is matched.
   */
  public exec: RouteHandler<S>;

  /**
   * Cached keys of the route parameters for performance optimization.
   */
  private readonly paramKeys: string[];


  /**
   * Creates a new Route instance.
   *
   * @param name - The unique name of the route.
   * @param path - The URL path pattern for the route.
   * @param method - The HTTP method for the route.
   * @param handler - The handler function to execute.
   * @param hostnames - The hostnames this route is available on.
   * @param params - Optional parameter definitions for validation and extraction.
   */
  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly method: RouteRequestMethod,
    handler: RouteHandler<S>,
    public readonly hostnames: RouteAvailability,
    public readonly params?: S,
  ) {
    this.exec = handler;
    // Cache keys for performance (params are static per route)
    this.paramKeys = this.params ? Object.keys(this.params) : [];

  }

  /**
   * Sets the openapi meta information.
   * @param meta
   */
  public openapi(meta: RouteMeta) : this {
    // Define as non-enumerable to avoid leaking into snapshots
    if (!Object.prototype.hasOwnProperty.call(this, '_meta')) {
      Object.defineProperty(this as unknown as Record<string, unknown>, '_meta', {
        value: meta,
        writable: true,
        configurable: true,
        enumerable: false,
      });
    } else {
      (this as unknown as Record<string, unknown>)['_meta'] = meta;
    }
    return this;
  }

  /** Returns the OpenAPI meta info for this route (if any). */
  public get meta(): Readonly<RouteMeta> | undefined {
    return (this as unknown as Record<string, unknown>)['_meta'] as RouteMeta | undefined;
  }

  /**
   * Extracts and validates parameters from the request.
   * Optimized to reduce object allocations by only creating the params object if needed.
   *
   * @param req - The incoming request object.
   * @returns An object containing the extracted parameters and any validation errors.
   */
  private extractParams(req: Request): { params: RouteParamValues<S>; errors: unknown[] } {
    if (this.paramKeys.length === 0) {
      return { params: {} as RouteParamValues<S>, errors: [] };
    }

    const errors: unknown[] = [];
    const params: Record<string, unknown> = {};

    for (let i = 0; i < this.paramKeys.length; i++) {
      const key = this.paramKeys[i]!;
      const paramDef = this.params![key]!;

      try {
        params[key] = paramDef.getValue(req);
      } catch (e) {
        if (e instanceof ZodError) {
          const rawValue = paramDef.getRawValue(req);
          const elevatedValue = paramDef.getElevatedValue(req);
          errors.push({
            message: `Invalid ${paramDef.type} parameter ${key}`,
            name: key,
            type: paramDef.type,
            readType: paramDef.readType,
            values: {
              raw: rawValue,
              elevated: elevatedValue,
            },
            issues: e.issues,
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
   *
   * @param req - The request object.
   * @param res - The response object.
   * @param app - The application instance.
   * @param onAborted - Callback to register an abortion handler.
   * @throws {BadRequestError} If parameter validation fails.
   */
  public async handleRequest(req: Request, res: Response, app: RoutesApp, onAborted: (handler: () => void) => void): Promise<void> {
    const { params, errors: paramErrors } = this.extractParams(req);
    if (paramErrors.length > 0) {
      throw new BadRequestError('Invalid request parameters', paramErrors as HttpErrorErrors);
    }

    const routeHandlerArgs: RouteHandlerArgs<S> = {
      app,
      req,
      res,
      onAborted,
      params,
    };

    await this.exec(routeHandlerArgs);
  }

}
