import { Result } from '../../result/index.js';
import type { Response } from '../response/index.js';
import type { HttpStatusCode } from '../status/index.js';

type JsonPayload<T> = { kind: 'json'; body: T };
type TextPayload = { kind: 'text'; body: string };
type BinaryPayload = { kind: 'binary'; body: Uint8Array };

export type HttpPayload<T> = JsonPayload<T> | TextPayload | BinaryPayload;

/**
 * HttpResult is a specialized `Result` for HTTP responses.
 *
 * Goals
 * - Provide a thin, efficient envelope to carry status, headers and body.
 * - Be backward-compatible with existing handler return types.
 * - Keep room for future streaming/file support without breaking changes.
 */
export class HttpResult<T> extends Result<T> {
  /** HTTP status code to write (defaults to 200). */
  public statusCode: HttpStatusCode = 200 as HttpStatusCode;
  /** Mutable header bag written in `finalize()`. */
  public headers: Record<string, string> = {};
  /** Optional content-type override; if absent, sensible defaults are used. */
  public contentType?: string;
  /** Discriminated body payload. */
  public payload?: HttpPayload<T>;

  /** Sets status code. */
  public status(code: HttpStatusCode): this { this.statusCode = code; return this; }
  /** Sets/overwrites a header. */
  public header(name: string, value: string): this { this.headers[name] = value; return this; }
  /** Sets content type explicitly. */
  public type(ct: string): this { this.contentType = ct; return this; }

  /** Sets a JSON payload and content type. */
  public json(body: T): this { this.payload = { kind: 'json', body }; if (!this.contentType) this.type('application/json'); return this; }
  /** Sets a text payload and content type. */
  public text(body: string): this { this.payload = { kind: 'text', body }; if (!this.contentType) this.type('text/plain; charset=utf-8'); return this; }
  /** Sets a binary payload (buffer/bytes). */
  public binary(body: Uint8Array, contentType?: string): this { this.payload = { kind: 'binary', body }; if (contentType) this.type(contentType); return this; }

  /**
   * Writes headers/status/body using the existing Response helper.
   * Designed to be minimal and fast; streaming/file support will be added in a later step.
   */
  public finalize(res: Response): void {
    // Status
    res.status(this.statusCode);
    // Headers
    for (const [k, v] of Object.entries(this.headers)) res.header(k, v);

    // Body
    const p = this.payload;
    if (!p) {
      // No body; send empty response (204 if no content was intended, but keep chosen code)
      res.send('');
      return;
    }

    switch (p.kind) {
      case 'json':
        // Response.json will set content-type if not set already
        res.json(p.body);
        return;
      case 'text':
        if (this.contentType) res.header('Content-Type', this.contentType);
        res.send(p.body);
        return;
      case 'binary':
        // Minimal binary support: encode to string for now (uWS requires RecognizedString).
        // In the next step, we can add raw write/tryEnd for buffers.
        if (this.contentType) res.header('Content-Type', this.contentType);
        res.send(Buffer.from(p.body).toString('binary'));
        return;
    }
  }

  // ---------------- Factories ----------------
  public static override ok<T>(body: T): HttpResult<T> {
    return new HttpResult<T>().status(200 as HttpStatusCode).json(body);
  }

  public static noContent(): HttpResult<undefined> {
    return new HttpResult<undefined>().status(204 as HttpStatusCode);
  }

  public static badRequest<T = unknown>(body?: T): HttpResult<T | undefined> {
    const r = new HttpResult<T | undefined>().status(400 as HttpStatusCode);
    if (body !== undefined) r.json(body as any);
    return r;
  }

  public static internal<T = unknown>(body?: T): HttpResult<T | undefined> {
    const r = new HttpResult<T | undefined>().status(500 as HttpStatusCode);
    if (body !== undefined) r.json(body as any);
    return r;
  }
}

// Type guards (duck-typing) to ease normalization later
export function isResultLike(value: unknown): value is { getMessages: () => unknown[]; isOk: () => boolean } {
  return !!value && typeof value === 'object' && 'getMessages' in value! && 'isOk' in value!;
}

export function isHttpResult<T = unknown>(value: unknown): value is HttpResult<T> {
  return value instanceof HttpResult;
}
