import type { Interceptor } from './interceptor.class.js';
import { type ZodType, type ZodVoid, z } from 'zod';

/**
 * The registry type.
 * Key: The Interceptor instance (the pointer).
 * Value: The data provided by that interceptor (unknown at this level, typed via resolve).
 */
export type InterceptorContextRegistry<S extends ZodType = ZodVoid> = Map<Interceptor<S>, unknown>;

/**
 * Common tools provided to every interceptor for context management.
 */
export type InterceptorContextTools<S extends ZodType> = {
  /**
   * Provides data to the request context.
   * The data is validated against the interceptor's defined output schema.
   */
  provide: (data: z.input<S>) => void;

  /**
   * Resolves data provided by another interceptor.
   * Throws an error if the data is missing or invalid.
   */
  resolve: <T extends ZodType>(interceptor: Interceptor<T>) => z.output<T>;
};