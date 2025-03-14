import type { HttpRequest } from 'uWebSockets.js';

export class PathParamsHandler {
  constructor(private readonly req: HttpRequest) {}

  public get(key: string): string | null {
    return this.req.getParameter(key) ?? null;
  }
}