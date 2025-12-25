import { ZodError } from 'zod';
import type { RoutesApp } from '../server/index.js';
import { type OpenApiExtender, routeMeta } from '../openapi/index.js';
import { type Request, type Response, BadRequestError, type ResultableResponse } from '../http/index.js';
import type { RequestInterceptor, ResponseInterceptor } from '../http/index.js';
import type { RouteHandler, RouteHandlerArgs } from './route-handler.type.js';
import type { RouteParams, RouteParamValues } from './param/route-params.type.js';
import type { HttpErrorErrors } from '../http/errors/http-error-errors.type.js';
import type { RouteAvailability, RouteMeta, RouteRequestMethod, RouteResponses } from './route-options.type.js';
import type { RouteInterceptorDefinition } from './route-interceptors.type.js';
import { OpenApiBase } from '../openapi/openapi-base.class.js';

/**
 * Represents a defined route within the application.
 * Acts as a container for route configuration, parameter definitions, and interceptor stacks.
 *
 * @template S - The shape of the route parameters.
 * @template R - The map of allowed response schemas (Status Code -> Zod Schema).
 */
export class Route<S extends RouteParams, R extends RouteResponses> extends OpenApiBase {
  /**
   * The function to execute when this route is matched.
   */
  public exec: RouteHandler<S, R>;

  /**
   * Cached keys of the route parameters for performance optimization.
   */
  private readonly paramKeys: string[];

  /**
   * The stack of request interceptors (Before) configured for this route.
   * Filled during application startup by the RoutesApp.
   */
  public beforeInterceptors: RequestInterceptor[] = [];

  /**
   * The stack of response interceptors (After) configured for this route.
   * Filled during application startup by the RoutesApp.
   */
  public afterInterceptors: ResponseInterceptor[] = [];

  /**
   * Allowed response schemas mapped by status code.
   * Used for runtime validation (optional) and OpenAPI response generation.
   */
  public readonly responses?: R;

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
   * @param responses - Optional map of response schemas.
   */
  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly method: RouteRequestMethod,
    handler: RouteHandler<S, R>,
    public readonly hostnames: RouteAvailability,
    public readonly params?: S,
    public readonly interceptors?: ReadonlyArray<RouteInterceptorDefinition>,
    responses?: R,
  ) {
    super();
    this.exec = handler;
    this.responses = responses;
    this.paramKeys = this.params ? Object.keys(this.params) : [];
  }

  /**
   * Configures the OpenAPI documentation for this route using a metadata object.
   * This object is converted into an OpenApiExtender internally.
   *
   * @param meta - The OpenAPI metadata (summary, description, tags, etc.).
   * @returns The Route instance for chaining.
   */
  public override openapi(meta: RouteMeta): this;

  /**
   * Configures the OpenAPI documentation for this route using a functional extender.
   *
   * @param builder - The callback to modify the OpenAPI operation object.
   * @returns The Route instance for chaining.
   */
  public override openapi(builder: OpenApiExtender): this;

  public override openapi(metaOrBuilder: RouteMeta | OpenApiExtender): this {
    if (typeof metaOrBuilder === 'function') {
      super.openapi(metaOrBuilder);
    } else {
      // Wrap the metadata object in the standard routeMeta extender and register it
      this.openapi(routeMeta(metaOrBuilder));
    }

    return this;
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
   * It also injects the dependency resolver into the handler arguments.
   *
   * @param req - The request object.
   * @param res - The response object.
   * @param app - The application instance.
   * @param onAborted - Callback to register an abortion handler.
   * @returns The raw result returned by the handler.
   * @throws {BadRequestError} If parameter validation fails.
   */
  public async handleRequest(req: Request, res: Response, app: RoutesApp, onAborted: (handler: () => void) => void): Promise<ResultableResponse> {
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

    return this.exec(routeHandlerArgs) as Promise<ResultableResponse>;
  }
}