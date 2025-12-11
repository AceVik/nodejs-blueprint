import type { Middleware } from './middleware.class.js';
import type { ErrorMiddleware } from './error/index.js';

/**
 * @deprecated
 */
export class OmitMiddleware<T extends Middleware | ErrorMiddleware> {
  constructor(public readonly target: T) {}
}

/**
 * @deprecated
 */
export function omit<T extends Middleware | ErrorMiddleware>(target: T): OmitMiddleware<T> {
  return new OmitMiddleware<T>(target);
}