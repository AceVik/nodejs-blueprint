import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { getStatusPhrase, type HttpStatusCode } from '../status/index.js';

/**
 * Wrapper around the uWebSockets.js HttpResponse.
 * Provides a fluent interface for constructing responses, managing headers,
 * and handling state (aborted/done) safely.
 */
export class Response {
  private _aborted = false;
  private _done = false;
  private _contentType: string | undefined = undefined;

  /**
   * Gets the raw uWebSockets.js HttpResponse object.
   */
  public get raw(): HttpResponse {
    return this.res;
  }

  /**
   * Indicates if the request was aborted by the client (e.g. closed connection).
   */
  public get aborted(): boolean {
    return this._aborted;
  }

  /**
   * Indicates if the response has already been sent/finished.
   */
  public get done(): boolean {
    return this._done;
  }

  /**
   * Creates a new Response instance.
   * Registers the abortion handler immediately to track connection state.
   *
   * @param res - The raw uWebSockets.js HttpResponse.
   * @param req - The raw uWebSockets.js HttpRequest.
   */
  constructor(
    private readonly res: HttpResponse,
    // @ts-expect-error TS6138: Property req is declared but its value is never read.
    private readonly req: HttpRequest,
  ) {
    // Track abortion immediately.
    // Note: If you overwrite onAborted later in the route, you must ensure you maintain this state tracking.
    this.res.onAborted(() => {
      this._aborted = true;
      this._done = true;
    });
  }

  /**
   * Sets the HTTP status code and status message.
   *
   * @param statusCode - The HTTP status code.
   * @returns The Response instance for chaining.
   */
  public status(statusCode: HttpStatusCode): this {
    if (this._done || this._aborted) return this;

    this.res.cork(() => {
      this.res.writeStatus(`${statusCode} ${getStatusPhrase(statusCode)}`);
    });
    return this;
  }

  /**
   * Sets a response header.
   *
   * @param key - The header name.
   * @param value - The header value.
   * @returns The Response instance for chaining.
   */
  public header(key: string, value: string): this {
    if (this._done || this._aborted) return this;

    if (key.toLowerCase() === 'content-type') {
      this._contentType = value;
    }

    this.res.cork(() => {
      this.res.writeHeader(key, value);
    });
    return this;
  }

  /**
   * Serializes an object to JSON, sets the Content-Type header, and sends the response.
   *
   * @param body - The object to serialize.
   */
  public json(body: unknown): void {
    if (this._done || this._aborted) return;

    const json = JSON.stringify(body);

    this.res.cork(() => {
      if (!this._contentType) {
        this.res.writeHeader('Content-Type', 'application/json');
      }
      this.res.end(json);
    });

    this._done = true;
  }

  /**
   * Sends a raw string body and ends the response.
   * Sets 'Content-Type' to 'text/plain' if not already set.
   *
   * @param body - The response body string.
   */
  public send(body: string): void {
    if (this._done || this._aborted) return;

    this.res.cork(() => {
      if (!this._contentType) {
        this.res.writeHeader('Content-Type', 'text/plain');
      }
      this.res.end(body);
    });

    this._done = true;
  }
}