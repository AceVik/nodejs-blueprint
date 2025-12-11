import assert from 'node:assert';
import { ZodArray, type ZodType } from 'zod';
import type { Request } from '../../http/index.js';
import type { RouteParamType } from './route-param-types.type.js';
import type { AdapterType, RouteParamAdapter } from './adapters/index.js';
import { getElevatorForSchema } from './get-elevator-for-schema.factory.js';
import type { RouteParamMeta } from './route-param-meta.type.js';
import { OpenApiBase } from '../../openapi/openapi-base.class.js';
import type { OpenApiExtender } from '../../openapi/index.js';

export type ElevationHandler<T, AP extends AdapterType> =
  AP extends 'all' ? (value: string[]) => T : (value: string | null) => T;

/**
 * Represents a route parameter definition.
 * Handles reading, validating, and transforming parameter values from the request.
 *
 * @template T - The type of the parameter value (Zod output).
 * @template PT - The type of the parameter location (path, query, header, cookie).
 * @template AP - The adapter type ('first', 'last', 'all').
 */
export class RouteParam<T, PT extends RouteParamType, AP extends AdapterType = 'first'> extends OpenApiBase {
  private _elevationHandler: ElevationHandler<T, AP> | undefined;

  /**
   * Internal storage for parameter-specific metadata.
   */
  private _meta: RouteParamMeta<PT> | undefined;

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
    public readonly type: PT,
    public readonly names: string[],
    public readonly schema: ZodType<T>,
    public readonly readType: AP,
    private readonly readAndValidateValueHandler: RouteParamAdapter<T>,
  ) {
    super();
    if (this.readType === 'all') {
      assert(this.schema instanceof ZodArray, 'Cannot use "all" adapter type with non-array schema');
    }
    this.readAndValidateValueHandler.bind(this);
    this._elevationHandler = getElevatorForSchema(this.schema, this.readType) as ElevationHandler<T, AP> | undefined;
  }

  /**
   * Registers an OpenAPI extender (function) for advanced customization.
   *
   * @param builder - The function to build/extend the route configuration.
   */
  public override openapi(builder: OpenApiExtender): this;

  /**
   * Sets the OpenAPI metadata for this parameter.
   * Strongly typed based on the parameter type (PT).
   *
   * @param meta - The metadata object (style, description, examples, etc.).
   */
  public override openapi(meta: RouteParamMeta<PT>): this;

  public override openapi(metaOrBuilder: RouteParamMeta<PT> | OpenApiExtender): this {
    if (typeof metaOrBuilder === 'function') {
      super.openapi(metaOrBuilder);
    } else {
      // Merge new meta with existing meta
      this._meta = { ...this._meta, ...metaOrBuilder };
    }
    return this;
  }

  /**
   * Returns the metadata for this parameter.
   */
  public get meta(): Readonly<RouteParamMeta<PT>> | undefined {
    return this._meta;
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
  public getRawValue(req: Request): AP extends 'all' ? string[] : (string | null) {
    return this.readAndValidateValueHandler(req, 'raw', this._elevationHandler) as AP extends 'all' ? string[] : (string | null);
  }

  /**
   * Checks if this parameter is a Path parameter.
   */
  public isPath(): this is RouteParam<T, 'path', AP> {
    return this.type === 'path';
  }

  /**
   * Checks if this parameter is a Query parameter.
   */
  public isQuery(): this is RouteParam<T, 'query', AP> {
    return this.type === 'query';
  }

  /**
   * Checks if this parameter is a Header parameter.
   */
  public isHeader(): this is RouteParam<T, 'header', AP> {
    return this.type === 'header';
  }

  /**
   * Checks if this parameter is a Cookie parameter.
   */
  public isCookie(): this is RouteParam<T, 'cookie', AP> {
    return this.type === 'cookie';
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
export function createRouteParam<T, PT extends RouteParamType, AP extends AdapterType = 'first'>(
  type: PT,
  names: string[],
  schema: ZodType<T>,
  readType: AP,
  handler: RouteParamAdapter<T>,
): RouteParam<T, PT, AP> {
  return new RouteParam<T, PT, AP>(type, names, schema, readType, handler);
}