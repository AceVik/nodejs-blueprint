import assert from 'node:assert';
import { ZodArray, type ZodType } from 'zod';
import type { Request } from '../../http/index.js';
import type { RouteParamType } from './route-param-types.type.js';
import type { AdapterType, RouteParamAdapter } from './adapters/index.js';
import { getElevatorForSchema } from './get-elevator-for-schema.factory.js';

/**
 * Handler function to elevate (transform) the raw parameter value.
 */
export type ElevationHandler<T, AP extends AdapterType> =
  AP extends 'all' ? (value: string[] | null | undefined) => T : (value: string | null | undefined) => T;

export type RouteParamMeta =  {
  description?: string;
  deprecated?: boolean;
};

/**
 * Represents a route parameter definition.
 * Handles reading, validating, and transforming parameter values from the request.
 *
 * @template T - The type of the parameter value.
 * @template AP - The adapter type ('first', 'last', 'all').
 */
export class RouteParam<T, AP extends AdapterType = 'first'> {
  /**
   * OpenApi meta information.
   */
  public meta?: RouteParamMeta;

  private _elevationHandler: ElevationHandler<T, AP> | undefined;

  /**
   * Creates a new RouteParam instance.
   *
   * @param type - The type of the parameter (path, query, header).
   * @param names - The possible names of the parameter in the request.
   * @param schema - The Zod schema for validation.
   * @param readType - The adapter type.
   * @param readAndValidateValueHandler - The handler to read and validate the value.
   */
  constructor(
    public readonly type: RouteParamType,
    public readonly names: string[],
    public readonly schema: ZodType<T>,
    public readonly readType: AP,
    private readonly readAndValidateValueHandler: RouteParamAdapter<T>,
  ) {
    if (this.readType === 'all') {
      assert(this.schema instanceof ZodArray, 'Cannot use "all" adapter type with non-array schema');
    }
    this.readAndValidateValueHandler.bind(this);
    this._elevationHandler = getElevatorForSchema(this.schema, this.readType) as ElevationHandler<T, AP> | undefined;
  }

  /**
   * Sets the openapi meta-information.
   * @param meta
   */
  public openapi(meta: RouteParamMeta): this {
    this.meta = meta;
    return this;
  }

  /**
   * Sets a custom elevation handler.
   *
   * @param handler - The elevation handler function.
   * @returns The RouteParam instance for chaining.
   */
  public elevate(handler: ElevationHandler<T, AP>) {
    this._elevationHandler = handler;
    return this;
  }

  /**
   * Gets the validated and elevated value from the request.
   *
   * @param req - The request object.
   * @returns The validated value.
   */
  public getValue(req: Request): T {
    return this.readAndValidateValueHandler(req, 'validated', this._elevationHandler);
  };

  /**
   * Gets the elevated value (before validation) from the request.
   *
   * @param req - The request object.
   * @returns The elevated value.
   */
  public getElevatedValue(req: Request): T {
    return this.readAndValidateValueHandler(req, 'elevated', this._elevationHandler);
  };

  /**
   * Gets the raw value from the request.
   *
   * @param req - The request object.
   * @returns The raw value (string or array of strings).
   */
  public getRawValue(req: Request): AP extends 'all' ? string | null | undefined : (string | null | undefined)[] {
    return this.readAndValidateValueHandler(req, 'raw', this._elevationHandler) as AP extends 'all' ? string | null | undefined : (string | null | undefined)[];
  }
}

/**
 * Factory function to create a new RouteParam instance.
 *
 * @param type - The type of the parameter.
 * @param names - The names of the parameter.
 * @param schema - The Zod schema.
 * @param readType - The adapter type.
 * @param handler - The adapter handler.
 * @returns A new RouteParam instance.
 */
export function createRouteParam<T, AP extends AdapterType = 'first'>(
  type: RouteParamType,
  names: string[],
  schema: ZodType<T>,
  readType: AP,
  handler: RouteParamAdapter<T>,
): RouteParam<T, AP> {
  return new RouteParam<T, AP>(type, names, schema, readType, handler);
}