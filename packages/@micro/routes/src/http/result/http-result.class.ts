import type { OutgoingHttpHeaders } from 'node:http';
import { HttpStatus, type HttpStatusCode } from '../status/index.js';
import { resolveHttpStatus } from './status-registry.store.js';
import { Result, type ResultMessage } from '../../core/index.js';
import { STATUS_PRIORITY } from './http-status-priority.const.js';
import type { DomainErrors } from './error-handling.types.js';

const findStatusCode = (
  candidates: Set<HttpStatusCode>,
  statusPriorityList: readonly HttpStatusCode[],
): HttpStatusCode | undefined => {
  for (let i = 0; i < statusPriorityList.length; i++) {
    if (candidates.has(statusPriorityList[i]!)) {
      return statusPriorityList[i];
    }
  }
  return undefined;
};

/**
 * Helper alias for semantic clarity.
 */
export type HttpSuccessResult<T> = HttpResult<T> & {
  unwrap(): T;
  getData(): T;
};

/**
 * Options for the fromResult factory method.
 */
export type FromResultOptions = {
  priorityOverride?: readonly HttpStatusCode[];
  customErrors?: DomainErrors;
};

/**
 * Represents an HTTP response result.
 * It encapsulates the status code, headers, the body, and diagnostic messages.
 *
 * This class acts as an "Elevated Result" containing both the domain data/messages
 * and the transport layer metadata (status, headers).
 *
 * @template TBody - The type of the response body data.
 */
export class HttpResult<TBody> extends Result<TBody> {
  protected _statusCode: HttpStatusCode;
  protected _contentType = '';
  public readonly headers: OutgoingHttpHeaders = {};

  /**
   * Returns the HTTP status code of the result.
   */
  public get statusCode(): HttpStatusCode {
    return this._statusCode;
  }

  /**
   * Returns the content type of the result.
   */
  public get contentType(): string {
    return this._contentType;
  }

  private constructor(
    statusCode: HttpStatusCode,
    protected override data?: TBody,
    protected override messages: ResultMessage[] = [],
  ) {
    super(data, messages);
    this._statusCode = statusCode;
  }

  /**
   * Checks if the response implies success (200-299).
   */
  public override isOk(): this is HttpSuccessResult<TBody> {
    return super.isOk();
  }

  /**
   * Checks if the response implies a client error (400-499).
   */
  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Checks if the response implies a server error (500-599).
   */
  public isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Creates a successful result (200 OK).
   * @param body - The payload.
   */
  public static override ok<T>(body: T): HttpSuccessResult<T> {
    return new HttpResult(HttpStatus.OK, body) as HttpSuccessResult<T>;
  }

  /**
   * Creates a result with a specific status code.
   * @param status - The HTTP status code.
   * @param body - The optional payload.
   */
  public static status<T>(status: HttpStatusCode, body?: T): HttpResult<T> {
    return new HttpResult(status, body);
  }

  /**
   * Elevates a Service `Result` to an `HttpResult`.
   * @param result - The service result.
   * @param options - Optional list to override the default status priority.
   */
  public static fromResult<T>(
    result: Result<T>,
    { priorityOverride, customErrors }: FromResultOptions = {},
  ): HttpResult<T> {
    let statCode: HttpStatusCode = HttpStatus.OK;

    if (!result.isOk()) {
      const candidates = new Set<HttpStatusCode>();
      const errors = result.errors();

      for (let i = 0; i < errors.length; i++) {
        const msg = errors[i]!;
        if (msg.payload) {
          const mappedStatus = resolveHttpStatus(msg.payload.code, customErrors);
          if (mappedStatus) {
            candidates.add(mappedStatus);
          }
        }
      }

      statCode =
        (priorityOverride && findStatusCode(candidates, priorityOverride)) ??
        findStatusCode(candidates, STATUS_PRIORITY) ??
        candidates.values().next().value ??
        HttpStatus.NOT_IMPLEMENTED;
    }

    return new HttpResult(
      statCode,
      result.getData(),
      result.getMessages() as ResultMessage[],
    );
  }

  /**
   * Sets a header.
   * @param key - Header name.
   * @param value - Header value.
   */
  public header(key: string, value: string | number | string[]): this {
    this.headers[key] = value;
    return this;
  }

  /**
   * Sets the Content-Type header.
   * @param type - The MIME type.
   */
  public type(type: string): this {
    this._contentType = type;
    this.headers['content-type'] = type;
    return this;
  }

  /**
   * Changes the body and the type of the HttpResult in-place.
   * Useful for serializers that convert an Object body to a String/Buffer body without reallocation.
   * @param newBody - The new body content.
   */
  public override morph<TNew>(newBody: TNew): HttpResult<TNew> {
    const self = this as unknown as HttpResult<TNew>;
    (self as unknown as { data: unknown }).data = newBody;
    return self;
  }
}

/**
 * Type guard to check if a value is an HttpResult.
 */
export function isHttpResult(val: unknown): val is HttpResult<unknown> {
  return val instanceof HttpResult;
}