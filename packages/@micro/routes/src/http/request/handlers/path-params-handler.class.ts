import type { HttpRequest } from 'uWebSockets.js';

/**
 * Handles optimized extraction of path parameters from the request.
 * Acts as a direct bridge to the uWebSockets.js C++ parameter storage.
 */
export class PathParamsHandler {
  /**
   * Creates an instance of the PathParamsHandler.
   * @param {HttpRequest} req - The raw uWebSockets.js request object.
   */
  constructor(private readonly req: HttpRequest) {}

  /**
   * Retrieves a path parameter by its identifier.
   * Performs a direct lookup on the underlying C++ resource.
   * @param {string} key - The parameter key or index identifier.
   * @returns {string | null} The parameter value if present, otherwise null.
   */
  public get(key: string): string | null {
    return this.req.getParameter(key as any) ?? null;
  }
}