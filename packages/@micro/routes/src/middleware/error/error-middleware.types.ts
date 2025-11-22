import type { ZodType } from 'zod';
import type { ErrorMiddlewareHandler } from './error-middleware-handler.type.js';
import type { HttpStatusAny } from '../../http/index.js';

/**
 * Maps HTTP status codes to Zod schemas.
 * Metadata (description, examples) must be attached directly to the schema via .openapi().
 */
export type ErrorResponseSchemas = Partial<Record<HttpStatusAny, ZodType>>;

export type { ErrorMiddlewareHandler };