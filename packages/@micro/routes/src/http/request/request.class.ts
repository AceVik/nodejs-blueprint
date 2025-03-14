import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import type { QueryParamsHandler, RequestMethod } from '@micro/routes/http';
import { PathParamsHandler, HeadersHandler } from './handlers';

const dec = new TextDecoder('ascii');

export class Request {
  private _url: string | null = null;
  public get url(): string {
    if (!this._url) {
      this._url = this.req.getUrl();
    }

    return this._url;
  }

  private _method: RequestMethod | null = null;
  public get method(): RequestMethod {
    if (!this._method) {
      this._method = this.req.getMethod().toUpperCase() as RequestMethod;
    }

    return this._method;
  }

  private _remoteAddress: string | null = null;
  public get remoteAddress(): string {
    if (!this._remoteAddress) {
      this._remoteAddress = dec.decode(this.res.getRemoteAddressAsText());
    }

    return this._remoteAddress;
  }

  private _remoteProxyAddress: string | null = null;
  public get remoteProxyAddress(): string {
    if (!this._remoteProxyAddress) {
      this._remoteProxyAddress = dec.decode(this.res.getProxiedRemoteAddressAsText());
    }

    return this._remoteProxyAddress;
  }

  private _query: QueryParamsHandler | null = null;
  public get query(): QueryParamsHandler {
    if (!this._query) {
      this._query = new URLSearchParams(this.req.getQuery());
    }

    return this._query;
  }

  public readonly path: PathParamsHandler;
  public readonly headers: HeadersHandler;

  public get raw(): HttpRequest {
    return this.req;
  }

  constructor(private readonly req: HttpRequest, private readonly res: HttpResponse) {
    this.path = new PathParamsHandler(req);
    this.headers = new HeadersHandler(req);
  }
}