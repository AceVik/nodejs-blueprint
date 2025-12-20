import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import type { QueryParamsHandler, RequestMethod } from '../../http/index.js';
import { CookieParamsHandler, HeadersHandler, PathParamsHandler } from './handlers/index.js';
import { ContextContainer } from '../context/context-container.class.js';

const dec = new TextDecoder('ascii');

/**
 * Wrapper around the uWebSockets.js HttpRequest and HttpResponse.
 * Provides convenient access to request properties like URL, method, headers, query and cookie parameters.
 * Also acts as a dependency injection container for Interceptors and Guards.
 */
export class Request extends ContextContainer {
  // -------------------------------------------------------------------------
  // Request Properties & Handlers
  // -------------------------------------------------------------------------

  private _url: string | null = null;

  /**
   * Gets the request URL.
   * Cached after the first access.
   */
  public get url(): string {
    if (!this._url) {
      this._url = this.req.getUrl();
    }
    return this._url;
  }

  private _method: RequestMethod | null = null;

  /**
   * Gets the HTTP method of the request.
   * Cached after the first access.
   */
  public get method(): RequestMethod {
    if (!this._method) {
      this._method = this.req.getMethod().toUpperCase() as RequestMethod;
    }
    return this._method;
  }

  private _remoteAddress: string | null = null;

  /**
   * Gets the remote address of the client.
   * Cached after the first access.
   */
  public get remoteAddress(): string {
    if (!this._remoteAddress) {
      this._remoteAddress = dec.decode(this.res.getRemoteAddressAsText());
    }
    return this._remoteAddress;
  }

  private _remoteProxyAddress: string | null = null;

  /**
   * Gets the proxied remote address of the client.
   * Cached after the first access.
   */
  public get remoteProxyAddress(): string {
    if (!this._remoteProxyAddress) {
      this._remoteProxyAddress = dec.decode(this.res.getProxiedRemoteAddressAsText());
    }
    return this._remoteProxyAddress;
  }

  private _query: QueryParamsHandler | null = null;

  /**
   * Gets the query parameters handler.
   * Cached after the first access.
   */
  public get query(): QueryParamsHandler {
    if (!this._query) {
      this._query = new URLSearchParams(this.req.getQuery());
    }
    return this._query;
  }

  /**
   * Handler for path parameters.
   */
  public readonly path: PathParamsHandler;

  /**
   * Handler for request headers.
   */
  public readonly headers: HeadersHandler;

  /**
   * Handler for request cookies.
   */
  public readonly cookies: CookieParamsHandler;

  /**
   * Gets the raw uWebSockets.js HttpRequest object.
   */
  public get raw(): HttpRequest {
    return this.req;
  }

  /**
   * Creates a new Request instance.
   *
   * @param req - The raw uWebSockets.js HttpRequest.
   * @param res - The raw uWebSockets.js HttpResponse (needed for address decoding).
   */
  constructor(private readonly req: HttpRequest, private readonly res: HttpResponse) {
    super();
    this.path = new PathParamsHandler(req);
    this.headers = new HeadersHandler(req);
    this.cookies = new CookieParamsHandler(req);
  }
}