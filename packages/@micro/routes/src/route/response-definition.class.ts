import type { ZodType } from 'zod';

export type ResponseHeadersShape = Record<string, ZodType>;
export type ResponseCookiesShape = Record<string, ZodType>;

export type ResponseMetaOpenApi = {
  description?: string;
};

/**
 * Represents the structural definition of a route response.
 * Holds the body schema as well as metadata for headers and cookies.
 *
 * This class is used during the route definition phase to declare the
 * API contract using a fluent interface.
 */
export class ResponseDefinition<TBody extends ZodType> {
  public _headers: ResponseHeadersShape = {};
  public _cookies: ResponseCookiesShape = {};
  public _meta: ResponseMetaOpenApi = {};

  constructor(public readonly schema: TBody) {}

  /**
   * Declares a header that is part of this response.
   *
   * @param name - The header name (e.g. 'X-Rate-Limit').
   * @param schema - The Zod schema defining the header value format.
   */
  public header(name: string, schema: ZodType): this {
    this._headers[name] = schema;
    return this;
  }

  /**
   * Declares a cookie that is set by this response.
   *
   * @param name - The cookie name (e.g. 'sessionId').
   * @param schema - The Zod schema defining the cookie value format.
   */
  public cookie(name: string, schema: ZodType): this {
    this._cookies[name] = schema;
    return this;
  }

  /**
   * Attaches specific OpenAPI metadata to this response definition,
   * such as a human-readable description.
   */
  public openapi(meta: ResponseMetaOpenApi): this {
    this._meta = { ...this._meta, ...meta };
    return this;
  }
}

/**
 * Factory function to start defining a response structure.
 *
 * Usage:
 * defineResponse(z.object({ ... }))
 * .header('X-Trace-Id', z.string())
 * .openapi({ description: 'Successful operation' })
 */
export function defineResponse<T extends ZodType>(schema: T): ResponseDefinition<T> {
  return new ResponseDefinition(schema);
}