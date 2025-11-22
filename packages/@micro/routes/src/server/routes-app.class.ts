import type { CreateRoutesAppOptions } from './create-routes-app-params.type.js';
import {
  type HttpRequest,
  type HttpResponse,
  type RecognizedString,
  type us_listen_socket,
  App,
  SSLApp,
  TemplatedApp, type AppOptions,
} from 'uWebSockets.js';
import { type Hostname, Route } from '../route/index.js';
import { ErrorMiddleware, type ErrorMiddlewareHandlerArgs, type NextFunction, type NextParams } from '../middleware/index.js';
import { httpErrorMiddleware, serverErrorMiddleware } from '../middleware/error/presets/index.js';
import { Request, Response } from '../http/index.js';
import { HTTP_ERROR_MIDDLEWARE, SERVER_ERROR_MIDDLEWARE } from '../middleware/error/symbols.js';

type UWSListenCallback = (listenSocket: us_listen_socket) => (void | Promise<void>);
type RawRouteHandler = (res: HttpResponse, req: HttpRequest) => void | Promise<void>;

/**
 * Registers a route handler with the underlying uWebSockets.js app.
 *
 * @param app - The uWebSockets.js app instance.
 * @param route - The route definition.
 * @param handler - The handler function.
 */
function registerRoute(app: TemplatedApp, route: Route<never>, handler: RawRouteHandler) {
  switch (route.method) {
  case 'GET':
    return app.get(route.path, handler);
  case 'POST':
    return app.post(route.path, handler);
  case 'PUT':
    return app.put(route.path, handler);
  case 'DELETE':
    return app.del(route.path, handler);
  case 'PATCH':
    return app.patch(route.path, handler);
  case 'OPTIONS':
    return app.options(route.path, handler);
  case 'HEAD':
    return app.head(route.path, handler);
  case 'TRACE':
    return app.trace(route.path, handler);
  case 'CONNECT':
    return app.connect(route.path, handler);
  case 'ANY':
    return app.any(route.path, handler);
  }
}

/**
 * The main application class for managing routes and the server.
 * Wraps uWebSockets.js to provide a more structured routing and middleware system.
 */
export class RoutesApp {
  private readonly rawApp: TemplatedApp;

  private _serverNames: Hostname[] = [];
  private _routes: Route<never>[] = [];
  private _errorMiddlewares: Record<string | symbol, ErrorMiddleware> = {
    [HTTP_ERROR_MIDDLEWARE]: httpErrorMiddleware,
    [SERVER_ERROR_MIDDLEWARE]: serverErrorMiddleware,
  };
  private _errorMiddlewaresOrder: (string | symbol)[] = [
    HTTP_ERROR_MIDDLEWARE,
    SERVER_ERROR_MIDDLEWARE,
  ];

  /**
   * Gets the list of registered server names (hostnames).
   */
  public get serverNames(): readonly Hostname[] {
    return this._serverNames;
  }

  /**
   * Gets the list of registered routes.
   */
  public get routes(): readonly Route<never>[] {
    return this._routes;
  }

  /**
   * Gets the registered error middlewares.
   */
  public get errorMiddlewares() {
    return this._errorMiddlewares;
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
    let idx;
    if ((idx = this.serverNames.indexOf(hostname)) >= 0) {
      this._serverNames.splice(idx, 1);
      this.rawApp.removeServerName(hostname);
    }

    return this;
  }

  /**
   * Executes the error middleware chain.
   * Optimized to avoid creating closures inside the loop.
   *
   * @param error - The error that occurred.
   * @param args - The arguments for the error middleware.
   */
  private async runErrorMiddlewares(error: unknown, args: Omit<ErrorMiddlewareHandlerArgs, 'next'>) {
    const middlewareNames = this._errorMiddlewaresOrder;
    let index = 0;
    const next: NextFunction = async (params?: NextParams) => {
      if (index < middlewareNames.length) {
        const name = middlewareNames[index++];
        const currentMiddleware = this.errorMiddlewares[name!];
        if (currentMiddleware) {
          await currentMiddleware.handleError(error, { ...args, prevParams: params, next });
        } else {
          // Skip if middleware is missing (defensive programming)
          await next(params);
        }
      }
    };

    await next();
  }

  /**
   * Creates a raw route handler for uWebSockets.js.
   *
   * @param route - The route to handle.
   * @returns A function that handles the raw request and response.
   */
  private createRouteHandler(route: Route<never>) {
    // Bind 'this' once to avoid repeated binding in the closure
    const self = this;

    return async function (rawRes: HttpResponse, rawReq: HttpRequest) {
      let req: Request;
      let res: Response;

      try {
        let onAbortedHandler: (() => void) | undefined;

        rawRes.onAborted(() => {
          if (onAbortedHandler) {
            onAbortedHandler();
          }
          // Ensure resources are cleaned up if needed, though uWS handles socket closure
        });

        req = new Request(rawReq, rawRes);
        res = new Response(rawRes, rawReq);

        await route.handleRequest(req, res, self, (handler) => {
          onAbortedHandler = handler;
        });
      } catch (err: unknown) {
        await self.runErrorMiddlewares(err, {
          route,
          rawRes,
          rawReq,
          // @ts-expect-error TS2454: Variable res is used before being assigned.
          res, req,
        });
      }
    };
  }

  /**
   * Adds a route to the application and registers it with uWebSockets.js.
   *
   * @param route - The route to add.
   */
  private addRoute(route: Route<never>) {
    this._routes.push(route);
    const routeHandler = this.createRouteHandler(route);

    if (route.hostnames === 'any' || route.hostnames === 'base') {
      registerRoute(this.rawApp, route, routeHandler);
      if (route.hostnames === 'base') return;
    }

    if (route.hostnames === 'any' || route.hostnames === 'all') {
      for (const hostname of this.serverNames) {
        registerRoute(this.rawApp.domain(hostname), route, routeHandler);
      }
      return;
    }

    const hostnames = Array.isArray(route.hostnames) ? route.hostnames : [route.hostnames];
    for (const hostname of hostnames) {
      registerRoute(this.rawApp.domain(hostname), route, routeHandler);
    }
  }

  /**
   * Registers middlewares or routes with the application.
   *
   * @param middlewaresOrRoutes - The middlewares or routes to register.
   * @returns The RoutesApp instance for chaining.
   */
  public use(...middlewaresOrRoutes: (ErrorMiddleware | Route<never>)[]): RoutesApp {
    for (const middlewareOrRoute of middlewaresOrRoutes) {
      if (middlewareOrRoute instanceof Route) {
        this.addRoute(middlewareOrRoute);
      } else if (middlewareOrRoute instanceof ErrorMiddleware) {
        const emw = middlewareOrRoute as ErrorMiddleware;
        if (emw.name in this._errorMiddlewares) {
          this._errorMiddlewaresOrder.splice(this._errorMiddlewaresOrder.indexOf(emw.name), 1);
        }

        this._errorMiddlewares[emw.name] = emw;
        this._errorMiddlewaresOrder = [emw.name, ...this._errorMiddlewaresOrder];
      } // TODO: Normal Middleware
    }

    return this;
  }

  /**
   * Starts listening on the specified port.
   *
   * @param port - The port to listen on.
   * @param cb - Callback function when listening starts.
   * @returns The RoutesApp instance.
   */
  listen(port: number, cb: UWSListenCallback): RoutesApp;
  /**
   * Starts listening on the specified host and port.
   *
   * @param host - The host to listen on.
   * @param port - The port to listen on.
   * @param cb - Callback function when listening starts.
   * @returns The RoutesApp instance.
   */
  listen(host: RecognizedString, port: number, cb: UWSListenCallback): RoutesApp;
  listen(hostOrPort: RecognizedString | number, portOrCb: number | UWSListenCallback, cb?: UWSListenCallback): RoutesApp {
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
    this.rawApp.listen_unix(cb, path);
    return this;
  }
}