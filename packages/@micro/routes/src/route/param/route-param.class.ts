import type { ZodSchema } from 'zod';
import type { Request } from '@micro/routes/http';
import type { RouteParamType } from './route-param-types.type';

export class RouteParam<T> {
  constructor(
    public readonly type: RouteParamType,
    public readonly name: string,
    public readonly schema: ZodSchema<T>,
    private readonly readAndValidateValueHandler: (req: Request) => T,
  ) {
    this.readAndValidateValueHandler.bind(this);
  }

  public getValue(req: Request): T {
    return this.readAndValidateValueHandler(req);
  };
}

export function createRouteParam<T>(
  type: RouteParamType,
  name: string,
  schema: ZodSchema<T>,
  handler: (req: Request) => T,
): RouteParam<T> {
  return new RouteParam(type, name, schema, handler);
}