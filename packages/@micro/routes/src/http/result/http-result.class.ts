import { serialize, type SerializeOptions } from 'cookie';
import type { Readable } from 'node:stream';
import { Result } from '../../core/index.js';
import { HttpStatus, type HttpStatusCode } from '../status/index.js';
import { type RouteError } from '../../route/error.type.js';
import { STATUS_PRIORITY } from './http-status-priority.const.js';
import type { HttpErrorResolver } from './http-error-resolver.type.js';
import type { HttpFileOptions, HttpStreamOptions } from './http-result-options.type.js';

/**
 * HttpResult is a pure data container for HTTP responses.
 */
export class HttpResult<T> extends Result<T> {
  public statusCode: HttpStatusCode = HttpStatus.OK;

  // Lazy storage
  private _headers?: Record<string, string>;
  private _cookies?: string[];
  private _contentType?: string;

  /**
   * Specific options for stream handling (e.g. range/offset).
   * Used by the runtime to configure the piping mechanism.
   */
  public streamOptions?: HttpStreamOptions;

  public get body(): T | undefined {
    return this.data;
  }

  public get headers(): Record<string, string> {
    return this._headers || {};
  }

  public get cookies(): readonly string[] {
    return this._cookies || [];
  }

  public get contentType(): string | undefined {
    return this._contentType;
  }

  public status(code: HttpStatusCode): this {
    this.statusCode = code;
    return this;
  }

  public header(name: string, value: string): this {
    if (!this._headers) this._headers = {};
    this._headers[name] = value;
    return this;
  }

  public type(contentType: string): this {
    this._contentType = contentType;
    return this.header('Content-Type', contentType);
  }

  public setCookie(name: string, value: string, options: SerializeOptions = {}): this {
    if (!this._cookies) this._cookies = [];
    if (options.path === undefined) options.path = '/';
    this._cookies.push(serialize(name, value, options));
    return this;
  }

  public clearCookie(name: string, options: SerializeOptions = {}): this {
    if (!this._cookies) this._cookies = [];
    const opts = { path: '/', ...options, expires: new Date(0) };
    this._cookies.push(serialize(name, '', opts));
    return this;
  }

  public attachment(filename?: string): this {
    const value = filename ? `attachment; filename="${filename}"` : 'attachment';
    return this.header('Content-Disposition', value);
  }

  public cache(maxAgeSeconds: number, mode: 'public' | 'private' = 'private'): this {
    return this.header('Cache-Control', `${mode}, max-age=${maxAgeSeconds}`);
  }

  // ---------------- Factories ----------------

  public static override ok<T>(body: T): HttpResult<T> {
    return new HttpResult<T>(body);
  }

  public static created<T>(body: T): HttpResult<T> {
    const res = new HttpResult<T>(body);
    res.statusCode = HttpStatus.CREATED;
    return res;
  }

  public static noContent(): HttpResult<void> {
    const res = new HttpResult<void>(undefined);
    res.statusCode = HttpStatus.NO_CONTENT;
    return res;
  }

  public static redirect(location: string, permanent = false): HttpResult<void> {
    const res = new HttpResult<void>(undefined);
    res.statusCode = permanent ? HttpStatus.MOVED_PERMANENTLY : HttpStatus.FOUND;
    res.header('Location', location);
    return res;
  }

  // ---------------- FILE Factory (Overloaded) ----------------

  /**
   * Retrieve file metadata from File object.
   * Filename is optional and can be provided in options.
   */
  public static file(
    content: File,
    options?: HttpFileOptions
  ): HttpResult<File>;

  /**
   * Retrieve file metadata from Blob object.
   * Filename is optional and can be provided in options.
   */
  public static file(
    content: Blob,
    options: HttpFileOptions & { filename: string }
  ): HttpResult<Blob>;

  /**
   * Retrieve file metadata from Buffer, Uint8Array, or string.
   * Filename is required and cannot be provided in options.
   */
  public static file<T extends Uint8Array | string | Buffer>(
    content: T,
    options: HttpFileOptions & { filename: string }
  ): HttpResult<T>;

  /**
   * Implementation
   */
  public static file(
    content: File | Blob | Uint8Array | string | Buffer,
    options: HttpFileOptions = {},
  ): HttpResult<any> {
    const res = new HttpResult(content);
    res.statusCode = HttpStatus.OK;

    const filename = options.filename ?? (content instanceof File ? content.name : undefined);
    const contentType = options.contentType ?? (
      (content instanceof Blob || content instanceof File) ? (content.type || undefined) : undefined
    );

    if (filename) {
      res.attachment(filename);
    }

    if (contentType) {
      res.type(contentType);
    }

    if (options.lastModified) {
      res.header('Last-Modified', options.lastModified.toUTCString());
    }

    return res;
  }

  // ---------------- STREAM Factory ----------------

  /**
   * Creates a response that pipes a stream to the client.
   * @param stream - The stream source (Node Readable or Web ReadableStream).
   * @param options - Configuration for filename, content-type, and offsets.
   */
  public static stream(
    stream: Readable | ReadableStream,
    options: HttpStreamOptions = {},
  ): HttpResult<Readable | ReadableStream> {
    const res = new HttpResult(stream);
    res.statusCode = HttpStatus.OK;

    // Store options for the runtime (e.g. to handle piping logic with offsets)
    res.streamOptions = options;

    if (options.contentType) {
      res.type(options.contentType);
    }

    if (options.filename) {
      res.attachment(options.filename);
    }

    // Handle Range/Length headers automatically if provided
    if (options.totalSize !== undefined) {
      res.header('Content-Length', options.totalSize.toString());
    }

    if (options.offset !== undefined || options.end !== undefined) {
      // Note: Usually the server handles the 'Content-Range' response header logic
      // based on the request header, but if we enforce a specific range:
      res.statusCode = HttpStatus.PARTIAL_CONTENT;
      // The Runtime should ideally construct the full Content-Range header:
      // bytes start-end/total
    }

    return res;
  }

  // ---------------- Error Handling ----------------

  public static fromResult<T>(
    result: Result<T>,
    resolvers: Partial<Record<HttpStatusCode, HttpErrorResolver>> = {},
  ): HttpResult<T | RouteError> {
    const res = new HttpResult<T | RouteError>(result.getData());
    res.includeMessages(result);

    if (result.isOk()) {
      return res;
    }

    res.statusCode = HttpStatus.BAD_REQUEST;

    for (let i = 0; i < STATUS_PRIORITY.length; i++) {
      const status = STATUS_PRIORITY[i]!;
      const resolver = resolvers[status];
      if (resolver && resolver(result)) {
        res.statusCode = status;
        break;
      }
    }

    return res;
  }
}

export function isHttpResult<T = unknown>(value: unknown): value is HttpResult<T> {
  return value instanceof HttpResult;
}