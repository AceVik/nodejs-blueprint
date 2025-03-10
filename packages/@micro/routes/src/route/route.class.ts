import type { RequestMethod } from '@micro/routes/http';
import type { RouteHandler } from './route-handler.type';
import type { RouteParam } from './param';

export class Route<TParams = never> {
  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly method: RequestMethod,
    public readonly handler: RouteHandler<TParams>,
    public readonly params?: Record<keyof TParams, RouteParam<unknown>>,
  ) {
  }
}
