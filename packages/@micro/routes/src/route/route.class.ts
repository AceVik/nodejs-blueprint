import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import type { RouteHandler, RouteHandlerArgs } from './route-handler.type.js';
import type { RouteParams, RouteParamValues } from './param/route-params.type.js';
import { type RequestMethod, Request, Response, getStatusBuffer, HttpStatus } from '../http/index.js';

export class Route<S extends RouteParams> {

  public exec: RouteHandler<S>;

  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly method: RequestMethod,
    handler: RouteHandler<S>,
    public readonly params?: S,
  ) {
    this.exec = handler;
  }

  public async handleRequest(rawRes: HttpResponse, rawReq: HttpRequest) {
    try {
      rawRes.onAborted(() => {
        console.log('Request aborted');
        rawRes.close();
      });

      const req = new Request(rawReq, rawRes);
      const res = new Response(rawRes, rawReq);

      const params: Record<string, unknown> = {};
      if (this.params)
        for (const key in this.params)
          params[key] = this.params[key]?.getValue(req);

      const routeHandlerArgs = {
        req,
        res,
        params: params as RouteParamValues<S>,
      } satisfies RouteHandlerArgs<S>;

      try {
        await this.exec(routeHandlerArgs);
      } catch (handlerErr) {
        // if handlerErr is a zod validation error - how to check?
        console.error(handlerErr);
        rawRes.writeStatus(getStatusBuffer(HttpStatus.INTERNAL_SERVER_ERROR));
        rawRes.end('Internal Server Error in request handler');
      }
    } catch (err) {
      console.error(err);
      rawRes.writeStatus(getStatusBuffer(HttpStatus.INTERNAL_SERVER_ERROR));
      rawRes.end('Internal Server Error');
    }
  }
}