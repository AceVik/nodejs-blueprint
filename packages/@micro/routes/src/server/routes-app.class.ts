import type { CreateRoutesAppOptions } from './create-routes-app-params.type.js';
import {
  type HttpRequest,
  type HttpResponse,
  type RecognizedString,
  type us_listen_socket,
  App,
  SSLApp,
  ListenOptions,
  TemplatedApp,
} from 'uWebSockets.js';
import { Route } from '../route/index.js';
import { ErrorMiddleware, type ErrorMiddlewareHandlerArgs, type NextFunction, type NextParams } from '../middleware/index.js';
import { httpErrorMiddleware, serverErrorMiddleware } from '../middleware/error/presets/index.js';
import { Request, Response } from '../http/index.js';

type UWSListenCallback = (listenSocket: us_listen_socket) => (void | Promise<void>);

export class RoutesApp {
  private readonly rawApp: TemplatedApp;

  private _routes: Route<never>[] = [];
  private _errorMiddlewares: ErrorMiddleware[] = [
    httpErrorMiddleware,
    serverErrorMiddleware,
  ];

  public get routes(): readonly Route<never>[] {
    return this._routes;
  }

  public get errorMiddlewares(): readonly ErrorMiddleware[] {
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

  private async runErrorMiddlewares(error: unknown, args: Omit<ErrorMiddlewareHandlerArgs, 'next'>) {
    const middlewares = this.errorMiddlewares;
    let index = 0;
    const next: NextFunction = async (params?: NextParams) => {
      if (index < middlewares.length) {
        const currentMiddleware = middlewares[index++];
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

  public use(...middlewaresOrRoutes: (ErrorMiddleware | Route<never>)[]): RoutesApp {
    for (const middlewareOrRoute of middlewaresOrRoutes) {
      if (middlewareOrRoute instanceof Route) {
        const route = middlewareOrRoute as Route<never>;
        this._routes.push(route);

        switch (route.method) {
        case 'GET':
          this.rawApp.get(route.path, this.createRouteHandler(route));
          break;
        case 'POST':
          this.rawApp.post(route.path, this.createRouteHandler(route));
          break;
        case 'PUT':
          this.rawApp.put(route.path, this.createRouteHandler(route));
          break;
        case 'DELETE':
          this.rawApp.del(route.path, this.createRouteHandler(route));
          break;
        case 'PATCH':
          this.rawApp.patch(route.path, this.createRouteHandler(route));
          break;
        case 'OPTIONS':
          this.rawApp.options(route.path, this.createRouteHandler(route));
          break;
        case 'HEAD':
          this.rawApp.head(route.path, this.createRouteHandler(route));
          break;
        case 'TRACE':
          this.rawApp.trace(route.path, this.createRouteHandler(route));
          break;
        case 'CONNECT':
          this.rawApp.connect(route.path, this.createRouteHandler(route));
          break;
        case 'ANY':
          this.rawApp.any(route.path, this.createRouteHandler(route));
          break;
        }
      } else if (middlewareOrRoute instanceof ErrorMiddleware) {
        this._errorMiddlewares.push(middlewareOrRoute);
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
    this.rawApp.listen(port, ListenOptions.LIBUS_LISTEN_EXCLUSIVE_PORT, cb);
    return this;
  }

  public listenUnix(cb: UWSListenCallback, path: RecognizedString) : RoutesApp {
    this.rawApp.listen_unix(cb, path);
    return this;
  }
}