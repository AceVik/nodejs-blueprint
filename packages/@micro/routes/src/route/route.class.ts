import { ZodError, type ZodType, type ZodVoid } from 'zod';
import { type Request, type Response, BadRequestError } from '../http/index.js';
import type { RouteHandler, RouteHandlerArgs } from './route-handler.type.js';
import type { RouteParams, RouteParamValues } from './param/route-params.type.js';
import type { RoutesApp } from '../server/index.js';
import type { RouteAvailability, RouteRequestMethod } from './route-options.type.js';
import type { HttpErrorErrors } from '../http/errors/http-error-errors.type.js';
import type { RouteInterceptorDefinitions } from './route-interceptors.type.js';
import type { RequestInterceptor, ResponseInterceptor } from '../http/interceptors/index.js';
import { OpenApiBase } from '../openapi/openapi-base.class.js';

/**
 * Represents a defined route within the application.
 * Acts as a container for route configuration, parameter definitions, and interceptor stacks.
 *
 * @template S - The shape of the route parameters.
 * @template R - The Zod schema for the response output (optional).
 */
export class Route<S extends RouteParams, R extends ZodType = ZodVoid> extends OpenApiBase {
  /**
   * The function to execute when this route is matched.
   */
  public exec: RouteHandler<S>;

  /**
   * Cached keys of the route parameters for performance optimization.
   */
  private readonly paramKeys: string[];

  /**
   * The stack of request interceptors (Before) configured for this route.
   * This is managed by the RoutesApp and will be filled on listener start.
   */
  public beforeInterceptors: RequestInterceptor[] = [];

  /**
   * The stack of response interceptors (After) configured for this route.
   * This is managed by the RoutesApp and will be filled on listener start.
   */
  public afterInterceptors: ResponseInterceptor[] = [];

  /**
   * Optional schema to validate and type the handler's return value.
   */
  public readonly output?: R;

  /**
   * Creates a new Route instance.
   *
   * @param name - The unique name of the route.
   * @param path - The URL path pattern for the route.
   * @param method - The HTTP method for the route.
   * @param handler - The handler function to execute.
   * @param hostnames - The hostnames this route is available on.
   * @param params - Optional parameter definitions for validation and extraction.
   * @param interceptors - Optional list of interceptors (or omits) specific to this route.
   * @param output - Optional Zod schema for the response.
   */
  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly method: RouteRequestMethod,
    handler: RouteHandler<S>,
    public readonly hostnames: RouteAvailability,
    public readonly params?: S,
    public readonly interceptors?: RouteInterceptorDefinitions,
    output?: R,
  ) {
    super();
    this.exec = handler;
    this.output = output;
    this.paramKeys = this.params ? Object.keys(this.params) : [];
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
   * Executes the route logic.
   * This method extracts parameters, validates them, and runs the handler.
   * It does NOT handle interceptors or sending the response; that is the responsibility of the caller (Route Manager).
   *
   * @param req - The request object.
   * @param res - The response object.
   * @param app - The application instance.
   * @param onAborted - Callback to register an abortion handler.
   * @returns The raw result returned by the handler (to be processed by Response Interceptors).
   * @throws {BadRequestError} If parameter validation fails.
   */
  public async handleRequest(req: Request, res: Response, app: RoutesApp, onAborted: (handler: () => void) => void): Promise<unknown> {
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

    return this.exec(routeHandlerArgs);
  }
}