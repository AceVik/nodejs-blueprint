import type { ZodType, z } from 'zod';
import type { Interceptor } from '../interceptors/index.js';

/**
 * ContextContainer provides a lifecycle-scoped key-value store for interceptors.
 * It is intended to be extended by request-like classes to share typed context
 * across Request/Response/Error interceptor phases.
 */
export class ContextContainer {
  private readonly _context = new Map<Interceptor<any>, any>();

  /**
   * Stores a value under the given interceptor key.
   */
  public provide<T extends ZodType>(interceptor: Interceptor<T>, value: z.input<T>): void {
    this._context.set(interceptor, value);
  }

  /**
   * Retrieves a previously provided value stored under the given interceptor key.
   */
  public resolve<T extends ZodType>(interceptor: Interceptor<T>): z.output<T> | undefined {
    return this._context.get(interceptor) as z.output<T> | undefined;
  }
}
