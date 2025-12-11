import type { z, ZodType } from 'zod';
import type { Request } from '../request/index.js';
import { Interceptor, isInterceptor } from './interceptor.class.js';
import type { InterceptorContextTools } from './interceptor.types.js';
import type { RouteInterceptorDefinitions } from '../../route/route-interceptors.type.js';
import { isOmitted } from './omit.js';

/**
 * Creates the context tools (provide/resolve) for a specific interceptor instance.
 * These tools allow the interceptor to securely store data in the request context
 * and resolve dependencies from other interceptors with type safety.
 *
 * @template S - The schema type of the interceptor.
 * @param req - The current request object containing the context registry.
 * @param currentInterceptor - The interceptor instance currently being executed.
 * @returns The context tools bound to the current interceptor and request.
 */
export function createInterceptorTools<S extends ZodType>(req: Request, currentInterceptor: Interceptor<S>): InterceptorContextTools<S> {
  return {
    provide: (data: z.input<S>) => {
      if (!currentInterceptor.output) {
        throw new Error(`Interceptor ${currentInterceptor.constructor.name} tries to provide data but has no output schema.`);
      }
      const parsed = currentInterceptor.output.parse(data);
      // Cast to generic Interceptor to satisfy the Map key type
      req.context.set(currentInterceptor as unknown as Interceptor, parsed);
    },

    resolve: <T extends ZodType>(target: Interceptor<T>): z.output<T> => {
      // Cast to generic Interceptor to satisfy the Map lookup
      const data = req.context.get(target as unknown as Interceptor);

      if (data === undefined) {
        throw new Error(`Dependency missing: Data from ${target.constructor.name} not found in context.`);
      }

      return data as z.output<T>;
    },
  };
}

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