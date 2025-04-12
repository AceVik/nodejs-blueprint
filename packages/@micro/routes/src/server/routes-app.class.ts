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

  public get serverNames(): readonly Hostname[] {
    return this._serverNames;
  }

  public get routes(): readonly Route<never>[] {
    return this._routes;
  }

  public get errorMiddlewares() {
    return this._errorMiddlewares;
  }

  public constructor(private readonly options?: CreateRoutesAppOptions) {
    const { ...appOptions } = this.options || {};
    const useSSL = !!(appOptions.key_file_name && appOptions.cert_file_name);
    this.rawApp = useSSL ? SSLApp(appOptions) : App(appOptions);

    process.on('SIGINT', () => {
      this.rawApp.close();
      process.exit(0);
    });
  }

  public addServerName(hostname: Hostname, options?: AppOptions): RoutesApp {
    if (!this.serverNames.includes(hostname)) {
      this._serverNames.push(hostname);
      this.rawApp.addServerName(hostname, options || {});
    }

    return this;
  }

  public removeServerName(hostname: Hostname): RoutesApp {
    let idx;
    if ((idx = this.serverNames.indexOf(hostname)) >= 0) {
      this._serverNames.splice(idx, 1);
      this.rawApp.removeServerName(hostname);
    }

    return this;
  }

  private async runErrorMiddlewares(error: unknown, args: Omit<ErrorMiddlewareHandlerArgs, 'next'>) {
    const middlewareNames = this._errorMiddlewaresOrder;
    let index = 0;
    const next: NextFunction = async (params?: NextParams) => {
      if (index < middlewareNames.length) {
        const currentMiddleware = this.errorMiddlewares[middlewareNames[index++]!];
        await currentMiddleware?.handleError(error, { ...args, prevParams: params, next });
      }
    };

    await next();
  }

  private createRouteHandler(route: Route<never>) {
    return (async function (this: RoutesApp, rawRes: HttpResponse, rawReq: HttpRequest) {
      let req: Request;
      let res: Response;

      try {
        let onAbortedHandler: () => void;
        rawRes.onAborted(() => {
          onAbortedHandler?.();
          rawRes.close();
        });

        req = new Request(rawReq, rawRes);
        res = new Response(rawRes, rawReq);

        await route.handleRequest(req, res, this, (handler) => {
          onAbortedHandler = handler;
        });
      } catch (err: unknown) {
        await this.runErrorMiddlewares(err, {
          route,
          rawRes,
          rawReq,
          // @ts-expect-error TS2454: Variable res is used before being assigned.
          res, req,
        });
      }
    }).bind(this);
  }

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

    for (const hostname of Array.isArray(route.hostnames) ? route.hostnames : [route.hostnames]) {
      registerRoute(this.rawApp.domain(hostname), route, routeHandler);
    }
  }

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

  listen(port: number, cb: UWSListenCallback) : RoutesApp;
  listen(host: RecognizedString, port: number, cb: UWSListenCallback) : RoutesApp;
  listen(hostOrPort: RecognizedString | number, portOrCb: number | UWSListenCallback, cb?: UWSListenCallback) : RoutesApp {
    if (typeof hostOrPort === 'number') {
      this.rawApp.listen(hostOrPort, portOrCb as UWSListenCallback);
    } else {
      this.rawApp.listen(hostOrPort, portOrCb as number, cb!);
    }

    return this;
  }

  public listenExclusive(port: number, cb: UWSListenCallback) : RoutesApp {
    this.rawApp.listen(port, 1, cb);
    return this;
  }

  public listenUnix(cb: UWSListenCallback, path: RecognizedString) : RoutesApp {
    this.rawApp.listen_unix(cb, path);
    return this;
  }
}