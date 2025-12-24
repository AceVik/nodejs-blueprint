import type { HttpStatusCode } from '../status/index.js';
import type { ErrorCode, Result } from '../../core/result/index.js';
import type { HttpResult } from './http-result.class.js';

export type DomainErrors = Record<ErrorCode, HttpStatusCode>;

/**
 * A function that takes the original Result and the determined status code
 * and produces a final HttpResult.
 * Used to override default JSON body generation for specific status codes.
 */
export type HttpErrorResolver = <T = unknown>(result: Result<T>, status: HttpStatusCode) => HttpResult<T>;

/**
 * A map of HTTP status codes to custom resolvers.
 */
export type HttpStatusResolvers = Partial<Record<HttpStatusCode, HttpErrorResolver>>;