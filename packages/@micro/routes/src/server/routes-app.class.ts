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
import type { CreateRoutesAppOptions } from './create-routes-app-params.type.js';
import { type Hostname, Route } from '../route/index.js';
import { Request, Response } from '../http/index.js';
import type { InfoObject, OpenAPIObject } from 'openapi3-ts/oas31';
import { OpenApiGenerator } from '../openapi/openapi-generator.js';
import { registerRouteWithApp } from './register-route.util.js';
import {
  isOmitted,
  type Interceptor,
  isRequestInterceptor,
  isResponseInterceptor,
  type RequestInterceptor,
  type ResponseInterceptor,
} from '../http/index.js';
import { mergeInterceptors } from '../http/interceptors/interceptors.utils.js';
import type { RouteInterceptorDefinition } from '../route/route-interceptors.type.js';
import { executeRoute } from './route-executor.js';
import type { ZodType } from 'zod';

type UWSListenCallback = (listenSocket: us_listen_socket) => (void | Promise<void>);

/**
 * The main application class for managing routes, interceptors, and the server.
 * Wraps uWebSockets.js to provide a structured architecture with Type-Safe Interceptors.
 */
export class RoutesApp {
  private readonly rawApp: TemplatedApp;

  private _serverNames: Hostname[] = [];
  private _routes: Route<never>[] = [];

  private _globalRequestInterceptors: RequestInterceptor<ZodType>[] = [];
  private _globalResponseInterceptors: ResponseInterceptor<ZodType>[] = [];

  public get serverNames(): readonly Hostname[] {
    return this._serverNames;
  }

  public get routes(): readonly Route<never>[] {
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
   * @param items - The interceptors, error middlewares, or routes to register.
   * @returns The RoutesApp instance for chaining.
   */
  public use(...items: (Interceptor<any> | Route<never>)[]): this {
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

  private addRoute(route: Route<never>) {
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

  private createRouteHandler(route: Route<never>) {
    const self = this;

    return async function (rawRes: HttpResponse, rawReq: HttpRequest) {
      let req: Request | undefined = undefined;
      let res: Response | undefined = undefined;

      try {
        let onAbortedHandler: (() => void) | undefined;

        rawRes.onAborted(() => {
          if (onAbortedHandler) onAbortedHandler();
        });

        req = new Request(rawReq, rawRes);
        res = new Response(rawRes, rawReq);

        const coreHandler = async () => {
          return await route.handleRequest(req!, res!, self, (handler) => {
            onAbortedHandler = handler;
          });
        };

        const finalResult = await executeRoute(req, res, route, coreHandler);

        if (finalResult !== undefined && !res.done && !res.aborted) {
          if (typeof finalResult === 'object') {
            res.json(finalResult);
          } else {
            res.send(String(finalResult));
          }
        }

      } catch (error: unknown) {
        // TODO: Implement handle global error catch
      }
    };
  }

  private _interceptorsArePrecalculated = false;

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

      // 1. Merge Globals and Locals (handling Omit)
      const mergedRequestInterceptors = mergeInterceptors(
        this._globalRequestInterceptors,
        localRequestDefs,
      ) as RequestInterceptor[];

      const mergedResponseInterceptors = mergeInterceptors(
        this._globalResponseInterceptors,
        localResponseDefs,
      ) as ResponseInterceptor[];

      // 2. Resolve Dependencies (DFS Topological Sort)
      route.beforeInterceptors = this.resolveInterceptorChain(mergedRequestInterceptors);
      route.afterInterceptors = this.resolveInterceptorChain(mergedResponseInterceptors);
    }

    this._interceptorsArePrecalculated = true;
  }

  /**
   * Resolves dependencies for a list of interceptors using Depth-First Search.
   * Ensures that parents are always executed before their children.
   * Automatically injects missing dependencies into the chain.
   *
   * @param interceptors - The initial list of interceptors.
   * @returns A new list with all dependencies resolved and ordered.
   */
  private resolveInterceptorChain<T extends Interceptor<any>>(interceptors: T[]): T[] {
    const visited = new Set<T>();
    const result: T[] = [];

    const visit = (interceptor: T) => {
      // Avoid cycles and duplicates
      if (visited.has(interceptor)) return;

      // Check if the interceptor has dependencies (e.g. RequestInterceptor)
      if ('dependencies' in interceptor && interceptor.dependencies instanceof Set) {
        for (const dep of (interceptor as any).dependencies) {
          visit(dep as T);
        }
      }

      visited.add(interceptor);
      result.push(interceptor);
    };

    // Iterate through the explicit list
    for (const item of interceptors) {
      visit(item);
    }

    return result;
  }

  /**
   * Starts listening on the specified port.
   *
   * @param port - The port to listen on.
   * @param cb - Callback function when listening starts.
   * @returns The RoutesApp instance.
   */
  public listen(port: number, cb: UWSListenCallback): RoutesApp;
  /**
   * Starts listening on the specified host and port.
   *
   * @param host - The host to listen on.
   * @param port - The port to listen on.
   * @param cb - Callback function when listening starts.
   * @returns The RoutesApp instance.
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
   *
   * @param port - The port to listen on.
   * @param cb - Callback function when listening starts.
   * @returns The RoutesApp instance.
   */
  public listenExclusive(port: number, cb: UWSListenCallback): RoutesApp {
    this.precalculateInterceptors();
    this.rawApp.listen(port, 1, cb);
    return this;
  }

  /**
   * Starts listening on a Unix socket.
   *
   * @param cb - Callback function when listening starts.
   * @param path - The path to the Unix socket.
   * @returns The RoutesApp instance.
   */
  public listenUnix(cb: UWSListenCallback, path: RecognizedString): RoutesApp {
    this.precalculateInterceptors();
    this.rawApp.listen_unix(cb, path);
    return this;
  }

  /**
   * Generates the OpenAPI 3.1 specification for the application.
   *
   * @param info - The API information object.
   * @returns The OpenAPI specification object.
   */
  public async getOpenApiSchema(info: InfoObject): Promise<OpenAPIObject> {
    this.precalculateInterceptors();
    const generator = new OpenApiGenerator();
    return generator.generate(info, this.routes);
  }
}