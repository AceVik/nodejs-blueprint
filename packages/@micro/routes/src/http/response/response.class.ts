import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { getStatusPhrase, type HttpStatusCode } from '../status/index.js';

/**
 * Wrapper around the uWebSockets.js HttpResponse.
 * Provides methods to set status, headers, and send the response body.
 */
export class Response {
  /**
   * Gets the raw uWebSockets.js HttpResponse object.
   */
  public get raw(): HttpResponse {
    return this.res;
  }

  // private readonly _headers = new Map<string, string[]>();

  private _contentType: string | undefined = undefined;

  /**
   * Creates a new Response instance.
   *
   * @param res - The raw uWebSockets.js HttpResponse.
   * @param req - The raw uWebSockets.js HttpRequest.
   */
  constructor(
    private readonly res: HttpResponse,
    // @ts-expect-error TS6138: Property req is declared but its value is never read.
    private readonly req: HttpRequest,
  ) {
  }

  /**
   * Sets the HTTP status code and status message.
   *
   * @param statusCode - The HTTP status code.
   * @returns The Response instance for chaining.
   */
  public status(statusCode: HttpStatusCode) {
    this.res.writeStatus(`${statusCode} ${getStatusPhrase(statusCode)}`);
    return this;
  }

  /**
   * Sets a response header.
   *
   * @param key - The header name.
   * @param value - The header value.
   * @returns The Response instance for chaining.
   */
  public header(key: string, value: string) {
    /*
    if (this._headers.has(key)) {
      this._headers.get(key)!.push(value);
    } else {
      this._headers.set(key, [value]);
    }*/

    if (key.toLowerCase() === 'content-type') {
      this._contentType = value;
    }

    this.res.writeHeader(key, value);
    return this;
  }

  /**
   * Sends the response body and ends the response.
   * Sets 'Content-Type' to 'text/plain' if not already set.
   *
   * @param body - The response body string.
   */
  public send(body: string) {
    this.res.cork(() => {
      if (!this._contentType) {
        this.res.writeHeader('Content-Type', 'text/plain');
      }

      this.res.end(body);
    });
  }
}