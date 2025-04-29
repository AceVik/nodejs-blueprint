import assert from 'node:assert';
import { ZodArray, type ZodType } from 'zod';
import type { Request } from '../../http/index.js';
import type { RouteParamType } from './route-param-types.type.js';
import type { AdapterType, RouteParamAdapter } from './adapters/index.js';
import { getElevatorForSchema } from './get-elevator-for-schema.factory.js';

export type ElevationHandler<T, AP extends AdapterType> =
  AP extends 'all' ? (value: string[] | null | undefined) => T : (value: string | null | undefined) => T;

export class RouteParam<T, AP extends AdapterType = 'first'> {
  private _elevationHandler: ElevationHandler<T, AP> | undefined;

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

  public elevate(handler: ElevationHandler<T, AP>) {
    this._elevationHandler = handler;
    return this;
  }

  public getValue(req: Request): T {
    return this.readAndValidateValueHandler(req, 'validated', this._elevationHandler);
  };

  public getElevatedValue(req: Request): T {
    return this.readAndValidateValueHandler(req, 'elevated', this._elevationHandler);
  };

  public getRawValue(req: Request): AP extends 'all' ? string | null | undefined : (string | null | undefined)[] {
    return this.readAndValidateValueHandler(req, 'raw', this._elevationHandler) as AP extends 'all' ? string | null | undefined : (string | null | undefined)[];
  }
}

export function createRouteParam<T, AP extends AdapterType = 'first'>(
  type: RouteParamType,
  names: string[],
  schema: ZodType<T>,
  readType: AP,
  handler: RouteParamAdapter<T>,
): RouteParam<T, AP> {
  return new RouteParam<T, AP>(type, names, schema, readType, handler);
}