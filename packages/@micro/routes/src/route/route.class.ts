import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { Request, RequestMethod, Response } from '@micro/routes/http';
import type { RouteHandler, RouteHandlerArgs } from './route-handler.type';
import type { RouteParam } from './param';
import { getStatusBuffer, HttpStatus } from '@micro/routes/http/status';

export class Route<TParams = object> {
  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly method: RequestMethod,
    public readonly handler: RouteHandler<TParams>,
    public readonly params?: Record<keyof TParams, RouteParam<unknown>>,
  ) {
  }

  public async handleRequest(res: HttpResponse, req: HttpRequest) {
    try {
      res.onAborted(() => {
        console.log('Request aborted');
        res.close();
      });
      const baseArgs = {
        req: new Request(req, res),
        res: new Response(res, req),
      };

      try {
        this.handler(baseArgs as RouteHandlerArgs<TParams>);
      } catch (handlerErr) {
        console.error(handlerErr);
        res.writeStatus(getStatusBuffer(HttpStatus.INTERNAL_SERVER_ERROR));
        res.end('Internal Server Error in request handler');
      }
    } catch (err) {
      console.error(err);
      res.writeStatus(getStatusBuffer(HttpStatus.INTERNAL_SERVER_ERROR));
      res.end('Internal Server Error');
    }
  }
}
