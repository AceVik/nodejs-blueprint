import { type Interceptor, isInterceptor } from './interceptor.class.js';
import type { RouteInterceptorDefinitions } from '../../route/route-interceptors.type.js';
import { isOmitted } from './omit.js';

/**
 * Merges global interceptors with route-specific interceptors using a move/omit strategy.
 * This function handles both Request and Response interceptor stacks.
 *
 * Strategy:
 * 1. **Omit**: If an interceptor is wrapped in `omit()`, it is removed from the global stack.
 * 2. **Move**: If a global interceptor is explicitly listed in the route definitions, it is moved from its global position to the route-specific position.
 * 3. **Keep**: All other global interceptors remain in their original order.
 *
 * @param globalInterceptors - The list of interceptors applied globally.
 * @param routeInterceptors - The list of interceptors specific to the route (including omits).
 * @returns A merged, readonly array of interceptors to be executed.
 */
export const mergeInterceptors = (
  globalInterceptors: ReadonlyArray<Interceptor<any>>,
  routeInterceptors: RouteInterceptorDefinitions,
): ReadonlyArray<Interceptor<any>> => {
  const touchedGlobals = new Set<Interceptor<any>>();
  const routeLevelInterceptors: Interceptor<any>[] = [];

  for (const item of routeInterceptors) {
    if (isInterceptor(item)) {
      touchedGlobals.add(item);
      routeLevelInterceptors.push(item);
    } else if (isOmitted(item)) {
      touchedGlobals.add(item.target);
    }
  }

  const effectiveGlobals: Interceptor<any>[] = [];
  for (const item of globalInterceptors) {
    if (!touchedGlobals.has(item)) {
      effectiveGlobals.push(item);
    }
  }

  return [...effectiveGlobals, ...routeLevelInterceptors];
};