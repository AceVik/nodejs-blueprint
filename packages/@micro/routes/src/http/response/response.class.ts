import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { Readable } from 'node:stream';
import { getStatusPhrase } from '../status/index.js';
import type { HttpResult } from '../result/http-result.class.js';

/**
 * Wrapper around the uWebSockets.js HttpResponse.
 * Acts as a dumb executor that pushes HttpResult data to the wire.
 * optimized for single-syscall operations via corking.
 */
export class Response {
  private _aborted = false;
  private _done = false;

  public get raw(): HttpResponse {
    return this.res;
  }

  public get aborted(): boolean {
    return this._aborted;
  }

  public get done(): boolean {
    return this._done;
  }

  constructor(
    private readonly res: HttpResponse,
    // @ts-expect-error TS6138: Kept for potential internal usage / debugging
    private readonly req: HttpRequest,
  ) {
    this.res.onAborted(() => {
      this._aborted = true;
      this._done = true;
    });
  }

  /**
   * The main method to send a response.
   * Takes the HttpResult container and writes it to the socket.
   */
  public sendResult(result: HttpResult<unknown>): void {
    if (this._done || this._aborted) return;

    const body = result.body;

    // ---------------------------------------------------------
    // Case A: Streams (Cannot be fully corked sync)
    // ---------------------------------------------------------
    if (body instanceof Readable || body instanceof ReadableStream) {
      // Cork only the headers part
      this.res.cork(() => {
        this.writeStatusAndHeaders(result);
      });
      this.pipeStream(body as Readable);
      return;
    }

    // ---------------------------------------------------------
    // Case B: Atomic Sync Response (The Happy Path)
    // ---------------------------------------------------------
    this.res.cork(() => {
      // 1. Write Metadata
      this.writeStatusAndHeaders(result);

      // 2. Write Body & End
      if (body === undefined || body === null) {
        this.res.end();
      }
      else if (typeof body === 'string') {
        this.res.end(body);
      }
      else if (body instanceof Uint8Array || Buffer.isBuffer(body)) {
        this.res.end(body);
      }
      else {
        // Fallback: If an interceptor didn't serialize the object yet, we force JSON.
        // This prevents the request from hanging on developer error.
        this.res.end(JSON.stringify(body));
      }
    });

    this._done = true;
  }

  /**
   * Helper to write status, headers and cookies inside a cork block.
   */
  private writeStatusAndHeaders(result: HttpResult<unknown>): void {
    // 1. Status
    this.res.writeStatus(`${result.statusCode} ${getStatusPhrase(result.statusCode)}`);

    // 2. Headers
    const headers = result.headers;
    for (const key in headers) {
      const val = headers[key];
      if (val) this.res.writeHeader(key, val);
    }

    // 3. Cookies
    const cookies = result.cookies;
    const len = cookies.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        this.res.writeHeader('Set-Cookie', cookies[i]!);
      }
    }
  }

  /**
   * Pipes a Node.js Readable stream to uWebSockets.
   */
  private pipeStream(stream: Readable): void {
    if (this._done || this._aborted) return;

    stream.on('data', (chunk) => {
      if (this._aborted) {
        stream.destroy();
        return;
      }

      const arrayBuffer = chunk instanceof Buffer
        ? chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength)
        : chunk;

      this.res.cork(() => {
        this.res.write(arrayBuffer);
      });
    });

    stream.on('end', () => {
      if (!this._aborted && !this._done) {
        this.res.cork(() => this.res.end());
      }
      this._done = true;
    });

    stream.on('error', () => {
      if (!this._done && !this._aborted) {
        // Try to close connection if header was already sent
        this.res.close();
      }
      this._done = true;
    });
  }
}