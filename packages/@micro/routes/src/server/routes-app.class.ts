import type { CreateRoutesAppOptions } from './create-routes-app-params.type.js';
import { toRecognizedString } from '../utils/index.js';
import {
  App,
  HttpRequest,
  HttpResponse,
  type RecognizedString,
  SSLApp,
  TemplatedApp,
  type us_listen_socket,
} from 'uWebSockets.js';
import { Route } from '../route/index.js';
import { ErrorMiddleware, ErrorMiddlewareHandlerArgs, NextFunction, NextParams } from '../middleware/index.js';
import { httpErrorMiddleware, serverErrorMiddleware } from '../middleware/error/presets/index.js';
import { Request, Response } from '../http/index.js';

const defaultHost = toRecognizedString('127.0.0.1');
const defaultCallback = () => undefined;

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

  public async listen(port: number, cb?: UWSListenCallback): Promise<void>;
  public async listen(host: RecognizedString, port: number, cb?: UWSListenCallback): Promise<void>;
  public async listen(unixPath: RecognizedString, cb?: UWSListenCallback): Promise<void>;
  public async listen(
    hostOrPortOrUnixPath: number | RecognizedString,
    portOrCb?: number | UWSListenCallback,
    cb?: UWSListenCallback,
  ): Promise<void> {
    if (typeof hostOrPortOrUnixPath === 'number') {
      const port = hostOrPortOrUnixPath;
      const callback = typeof portOrCb === 'function' ? portOrCb : cb || defaultCallback;
      this.rawApp.listen(defaultHost, port, callback);
    } else {
      if (typeof portOrCb === 'number') {
        const host = hostOrPortOrUnixPath as RecognizedString;
        const port = portOrCb;
        this.rawApp.listen(host, port, cb || defaultCallback);
      } else {
        const unixPath = hostOrPortOrUnixPath as RecognizedString;
        const callback = typeof portOrCb === 'function' ? portOrCb : cb || defaultCallback;
        this.rawApp.listen_unix(callback, unixPath);
      }
    }
  }
}