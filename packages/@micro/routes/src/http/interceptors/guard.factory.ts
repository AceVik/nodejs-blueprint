import type { ZodType, ZodVoid } from 'zod';
import type { RequestInterceptorHandler } from './request-interceptor.class.js';
import { Guard } from './guard.class.js';

/**
 * Creates a new Guard instance.
 *
 * Use `.openapi({...})` to define it as an AuthN guard (Security Scheme)
 * or as an AuthZ guard (Scopes).
 * Use `.after(parent)` to inherit the Security Scheme context.
 *
 * @param handler - The runtime validation logic.
 * @returns A configured Guard instance.
 */
export function guard<S extends ZodType = ZodVoid>(
  handler: RequestInterceptorHandler,
): Guard<S> {
  return new Guard<S>(handler);
}