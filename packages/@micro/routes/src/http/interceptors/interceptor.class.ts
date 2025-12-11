import type { ZodType, ZodVoid } from 'zod';
import { OpenApiBase } from '../../openapi/openapi-base.class.js';

/**
 * Abstract base class for all interceptors.
 * Defines the output schema and OpenAPI capabilities.
 *
 * @template S - The Zod schema type of the data this interceptor provides. Defaults to ZodVoid.
 */
export abstract class Interceptor<S extends ZodType = ZodVoid> extends OpenApiBase{
  /**
   * The schema describing the data this interceptor provides to the context.
   */
  public readonly output?: S;

  /**
   * Creates a new Interceptor.
   *
   * @param output - Optional Zod schema for context data.
   */
  protected constructor(output?: S) {
    super();
    this.output = output;
  }
}

/**
 * Type guard to check if a value is an Interceptor.
 * Validates against the class instance and narrows the type to an Interceptor with any valid Zod schema.
 *
 * @param value - The object to check.
 * @returns True if the object is an instance of Interceptor.
 */
export function isInterceptor(value: unknown): value is Interceptor<ZodType> {
  return value instanceof Interceptor;
}