import type { Result } from '../../core/index.js';

/**
 * Resolver function type.
 * Returns true if the result matches the criteria for the associated HTTP status.
 */
export type HttpErrorResolver = (result: Result) => boolean;