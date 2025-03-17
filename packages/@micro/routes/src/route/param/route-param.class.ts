import type { ZodSchema } from 'zod';
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
    public readonly name: string,
    public readonly schema: ZodSchema<T>,
    public readonly readType: AP,
    private readonly readAndValidateValueHandler: RouteParamAdapter<T>,
  ) {
    this.readAndValidateValueHandler.bind(this);
    this._elevationHandler = getElevatorForSchema(this.schema, this.readType) as ElevationHandler<T, AP> | undefined;
  }

  public elevate(handler: ElevationHandler<T, AP>) {
    this._elevationHandler = handler;
    return this;
  }

  public getValue(req: Request): T {
    return this.readAndValidateValueHandler(req, this._elevationHandler);
  };
}

export function createRouteParam<T, AP extends AdapterType = 'first'>(
  type: RouteParamType,
  name: string,
  schema: ZodSchema<T>,
  readType: AP,
  handler: RouteParamAdapter<T>,
): RouteParam<T, AP> {
  return new RouteParam<T, AP>(type, name, schema, readType, handler);
}