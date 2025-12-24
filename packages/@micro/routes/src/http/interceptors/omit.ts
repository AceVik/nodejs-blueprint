import { Interceptor } from './interceptor.class.js';

/**
 * Wrapper class to indicate that a specific interceptor should be excluded from execution.
 * Used to remove global interceptors from specific routes.
 */
export class OmitInterceptor<H extends Function = Function> {
  /**
   * Creates a new OmitInterceptor instance.
   * @param target - The interceptor instance to omit (can be Request- or ResponseInterceptor).
   */
  constructor(public readonly target: Interceptor<H>) {}
}

/**
 * Marks an interceptor to be omitted.
 * This effectively removes a global interceptor from the execution chain for the current route.
 *
 * @param target - The interceptor instance to exclude.
 * @returns An OmitInterceptor instance.
 */
export function omit<H extends Function>(target: Interceptor<H>): OmitInterceptor<H> {
  return new OmitInterceptor<H>(target);
}

/**
 * Type guard to check if an object is an OmitInterceptor.
 *
 * @param obj - The object to check.
 */
export function isOmitted<H extends Function = Function>(obj: unknown): obj is OmitInterceptor<H> {
  return obj instanceof OmitInterceptor;
}