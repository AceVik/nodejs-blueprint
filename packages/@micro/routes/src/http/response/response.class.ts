import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { getStatusPhrase, type HttpStatusCode } from '../status/index.js';

export class Response {
  public get raw(): HttpResponse {
    return this.res;
  }

  // private readonly _headers = new Map<string, string[]>();

  private _contentType: string | undefined = undefined;
  constructor(
    private readonly res: HttpResponse,
    // @ts-expect-error TS6138: Property req is declared but its value is never read.
    private readonly req: HttpRequest,
  ) {
  }

  public status(statusCode: HttpStatusCode) {
    this.res.writeStatus(`${statusCode} ${getStatusPhrase(statusCode)}`);
    return this;
  }

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

  public send(body: string) {
    if (!this._contentType) {
      this.res.writeHeader('Content-Type', 'text/plain');
    }

    this.res.end(body);
  }
}