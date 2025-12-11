import { type Interceptor } from './interceptor.class.js';
import { type ZodVoid } from 'zod';

/**
 * Wrapper class to indicate that a specific interceptor should be excluded from execution.
 * Used to remove global interceptors from specific routes.
 */
export class OmitInterceptor {
  /**
   * Creates a new OmitInterceptor instance.
   * @param target - The interceptor instance to omit.
   */
  constructor(public readonly target: Interceptor<ZodVoid>) {}
}

/**
 * Marks an interceptor to be omitted.
 *
 * @param target - The interceptor to exclude.
 * @returns An OmitInterceptor instance.
 */
export function omit(target: Interceptor<ZodVoid>): OmitInterceptor {
  return new OmitInterceptor(target);
}

/**
 * Type guard to check if an object is an OmitInterceptor.
 *
 * @param obj - The object to check.
 */
export function isOmitted(obj: unknown): obj is OmitInterceptor {
  return obj instanceof OmitInterceptor;
}