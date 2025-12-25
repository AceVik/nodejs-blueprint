import {
  type HttpRequest,
  type HttpResponse,
  type RecognizedString,
  type us_listen_socket,
  App,
  SSLApp,
  TemplatedApp,
  type AppOptions,
} from 'uWebSockets.js';
import type { InfoObject, OpenAPIObject } from 'openapi3-ts/oas31';

import type { CreateRoutesAppOptions } from './create-routes-app-params.type.js';
import { type Hostname, Route } from '../route/index.js';
import {
  Request,
  Response,
  HttpResult,
  isHttpResult,
  isOmitted,
  type Interceptor,
  isRequestInterceptor,
  isResponseInterceptor,
  type RequestInterceptor,
  type ResponseInterceptor, ResultableResponse,
} from '../http/index.js';
import { OpenApiGenerator } from '../openapi/openapi-generator.js';
import { registerRouteWithApp } from './register-route.util.js';
import { mergeInterceptors } from '../http/interceptors/interceptors.utils.js';
import type { RouteInterceptorDefinition } from '../route/route-interceptors.type.js';
import { responseJsonSerializer, resultNormalizer } from '../http/interceptors/response/presets/index.js';

type UWSListenCallback = (listenSocket: us_listen_socket) => (void | Promise<void>);

/**
 * The main application class for managing routes, interceptors, and the server.
 * Wraps uWebSockets.js to provide a structured architecture with Type-Safe Interceptors.
 */
export class RoutesApp {
  private readonly rawApp: TemplatedApp;

  private _serverNames: Hostname[] = [];
  private _routes: Route<never, never>[] = [];

  private _globalRequestInterceptors: RequestInterceptor<any>[] = [];
  private _globalResponseInterceptors: ResponseInterceptor<any>[] = [];

  private _interceptorsArePrecalculated = false;

  public get serverNames(): readonly Hostname[] {
    return this._serverNames;
  }

  public get routes(): readonly Route<never, never>[] {
    return this._routes;
  }

  /**
   * Creates a new RoutesApp instance.
   *
   * @param options - Configuration options for the application.
   */
  public constructor(private readonly options?: CreateRoutesAppOptions) {
    const { ...appOptions } = this.options || {};
    const useSSL = !!(appOptions.key_file_name && appOptions.cert_file_name);
    this.rawApp = useSSL ? SSLApp(appOptions) : App(appOptions);

    this._globalResponseInterceptors.push(resultNormalizer);
    this._globalResponseInterceptors.push(responseJsonSerializer);

    process.on('SIGINT', () => {
      this.rawApp.close();
      process.exit(0);
    });
  }

  /**
   * Adds a server name (virtual host) to the application.
   *
   * @param hostname - The hostname to add.
   * @param options - Optional configuration for the virtual host.
   * @returns The RoutesApp instance for chaining.
   */
  public addServerName(hostname: Hostname, options?: AppOptions): RoutesApp {
    if (!this.serverNames.includes(hostname)) {
      this._serverNames.push(hostname);
      this.rawApp.addServerName(hostname, options || {});
    }
    return this;
  }

  /**
   * Removes a server name from the application.
   *
   * @param hostname - The hostname to remove.
   * @returns The RoutesApp instance for chaining.
   */
  public removeServerName(hostname: Hostname): RoutesApp {
    const idx = this.serverNames.indexOf(hostname);
    if (idx >= 0) {
      this._serverNames.splice(idx, 1);
      this.rawApp.removeServerName(hostname);
    }
    return this;
  }

  /**
   * Registers interceptors, error middlewares, or routes with the application.
   * Automatically sorts interceptors into Request or Response stacks.
   *
   * @param items - The interceptors or routes to register.
   * @returns The RoutesApp instance for chaining.
   */
  public use(...items: (Interceptor<any> | Route<never, never>)[]): this {
    for (const item of items) {
      if (item instanceof Route) {
        this.addRoute(item);
      } else if (isRequestInterceptor(item)) {
        this._globalRequestInterceptors.push(item);
      } else if (isResponseInterceptor(item)) {
        this._globalResponseInterceptors.push(item);
      }
    }
    return this;
  }

  /**
   * Starts listening on the specified port.
   */
  public listen(port: number, cb: UWSListenCallback): RoutesApp;
  /**
   * Starts listening on the specified host and port.
   */
  public listen(host: RecognizedString, port: number, cb: UWSListenCallback): RoutesApp;
  public listen(hostOrPort: RecognizedString | number, portOrCb: number | UWSListenCallback, cb?: UWSListenCallback): RoutesApp {
    this.precalculateInterceptors();

    if (typeof hostOrPort === 'number') {
      this.rawApp.listen(hostOrPort, portOrCb as UWSListenCallback);
    } else {
      this.rawApp.listen(hostOrPort, portOrCb as number, cb!);
    }
    return this;
  }

  /**
   * Starts listening on the specified port with exclusive access.
   */
  public listenExclusive(port: number, cb: UWSListenCallback): RoutesApp {
    this.precalculateInterceptors();
    this.rawApp.listen(port, 1, cb);
    return this;
  }

  /**
   * Starts listening on a Unix socket.
   */
  public listenUnix(cb: UWSListenCallback, path: RecognizedString): RoutesApp {
    this.precalculateInterceptors();
    this.rawApp.listen_unix(cb, path);
    return this;
  }

  /**
   * Generates the OpenAPI 3.1 specification for the application.
   */
  public async getOpenApiSchema(info: InfoObject): Promise<OpenAPIObject> {
    this.precalculateInterceptors();
    const generator = new OpenApiGenerator();
    return generator.generate(info, this.routes);
  }

  // -------------------------------------------------------------------------
  // Internal Logic
  // -------------------------------------------------------------------------

  private addRoute(route: Route<never, never>) {
    this._routes.push(route);
    const routeHandler = this.createRouteHandler(route);

    if (route.hostnames === 'any' || route.hostnames === 'base') {
      registerRouteWithApp(this.rawApp, route, routeHandler);
      if (route.hostnames === 'base') return;
    }

    if (route.hostnames === 'any' || route.hostnames === 'all') {
      for (const hostname of this.serverNames) {
        registerRouteWithApp(this.rawApp.domain(hostname), route, routeHandler);
      }
      return;
    }

    const hostnames = Array.isArray(route.hostnames) ? route.hostnames : [route.hostnames];
    for (const hostname of hostnames) {
      registerRouteWithApp(this.rawApp.domain(hostname), route, routeHandler);
    }
  }

  private createRouteHandler(route: Route<never, never>) {
    const self = this;

    return async function (rawRes: HttpResponse, rawReq: HttpRequest) {
      const reqResult = Request.init(rawReq, rawRes);
      const resResult = Response.init(rawRes);

      if (!reqResult.isOk() || !resResult.isOk()) {
        reqResult.includeMessages(resResult);
        // TODO: Handle errors - maybe we need sth. like this.handleGlobalError(reqResult)
        return;
      }

      const req = reqResult.unwrap()!;
      const res = resResult.unwrap()!;
      let onAbortedHandler: (() => void) | undefined;

      // Ensure that if the client disconnects prematurely, we stop processing
      rawRes.onAborted(() => {
        if (onAbortedHandler) onAbortedHandler();
      });

      try {
        // --- Request Interceptor Phase ---
        // Iterate linearly through request interceptors (Guards, Context, Logging).
        // If any interceptor returns `false`, it acts as a circuit breaker,
        // stopping the chain immediately (e.g. Auth Guard failed).
        const requestInterceptors = route.beforeInterceptors;
        let chainContinued = true;

        for (const interceptor of requestInterceptors) {
          const result = await interceptor.intercept({ req, res, route });
          if (result === false) {
            chainContinued = false;
            break;
          }
        }

        // --- Core Execution Phase ---
        // Only run the handler if the request interceptor chain was not broken.
        // We wrap the user handler execution to capture the abort handler.
        let rawResult: ResultableResponse | null = null;
        if (chainContinued) {
          rawResult = await route.handleRequest(req, res, self, (handler) => {
            onAbortedHandler = handler;
          });
        }

        // --- Response Interceptor Phase ---
        // Pipeline model: The output of one interceptor (or the handler) is passed
        // as the input to the next. Used for transformation, serialization, enveloping.
        const responseInterceptors = route.afterInterceptors;
        let currentResult = rawResult;

        for (const interceptor of responseInterceptors) {
          currentResult = await interceptor.intercept({
            req,
            res,
            route,
            result: currentResult,
          });
        }

        // --- Normalization Phase ---
        // Ensure the final result is a uniform HttpResult structure before sending.
        // If the chain was aborted (undefined result) or a plain value returned, wrap it.
        let finalResult: HttpResult<unknown>;

        if (isHttpResult(currentResult)) {
          finalResult = currentResult;
        } else {
          finalResult = HttpResult.ok(currentResult);
        }

        res.sendResult(finalResult);

      } catch (error: unknown) {
        // TODO: Need a fresh global error handler
      }
    };
  }

  private precalculateInterceptors() {
    if (this._interceptorsArePrecalculated) return;

    for (const route of this._routes) {
      const localDefs = route.interceptors || [];

      const localRequestDefs: RouteInterceptorDefinition[] = [];
      const localResponseDefs: RouteInterceptorDefinition[] = [];

      for (const def of localDefs) {
        if (isOmitted(def)) {
          localRequestDefs.push(def);
          localResponseDefs.push(def);
        } else if (isRequestInterceptor(def)) {
          localRequestDefs.push(def);
        } else if (isResponseInterceptor(def)) {
          localResponseDefs.push(def);
        }
      }

      const mergedRequestInterceptors = mergeInterceptors(
        this._globalRequestInterceptors,
        localRequestDefs,
      ) as RequestInterceptor[];

      const mergedResponseInterceptors = mergeInterceptors(
        this._globalResponseInterceptors,
        localResponseDefs,
      ) as ResponseInterceptor[];

      route.beforeInterceptors = this.resolveInterceptorChain(mergedRequestInterceptors);
      route.afterInterceptors = this.resolveInterceptorChain(mergedResponseInterceptors);
    }

    this._interceptorsArePrecalculated = true;
  }

  private resolveInterceptorChain<T extends Interceptor<any>>(interceptors: T[]): T[] {
    const visited = new Set<T>();
    const result: T[] = [];

    const visit = (interceptor: T) => {
      if (visited.has(interceptor)) return;

      if ('dependencies' in interceptor && interceptor.dependencies instanceof Set) {
        for (const dep of (interceptor as any).dependencies) {
          visit(dep as T);
        }
      }

      visited.add(interceptor);
      result.push(interceptor);
    };

    for (const item of interceptors) {
      visit(item);
    }

    return result;
  }
}