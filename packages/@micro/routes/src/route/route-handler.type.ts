import type { Request, Response } from '@micro/routes/http';

export type RouteHandlerArgs<TParams> = TParams & {
  req: Request;
  res: Response;
};

export type RouteHandler<TParams> = (params: RouteHandlerArgs<TParams>) => Promise<void> | void;