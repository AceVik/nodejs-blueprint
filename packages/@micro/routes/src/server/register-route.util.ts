import type { TemplatedApp, HttpRequest, HttpResponse } from 'uWebSockets.js';
import type { Route } from '../route/index.js';
import type { Awaitable } from '../core/index.js';

type RawRouteHandler = (res: HttpResponse, req: HttpRequest) => Awaitable<void>;

/**
 * Registers a route handler with the underlying uWebSockets.js app based on the HTTP method.
 *
 * @param app - The uWebSockets.js app instance (or domain).
 * @param route - The route definition.
 * @param handler - The handler function.
 */
export function registerRouteWithApp(app: TemplatedApp, route: Route<never, never>, handler: RawRouteHandler) {
  switch (route.method) {
  case 'GET': return app.get(route.path, handler);
  case 'POST': return app.post(route.path, handler);
  case 'PUT': return app.put(route.path, handler);
  case 'DELETE': return app.del(route.path, handler);
  case 'PATCH': return app.patch(route.path, handler);
  case 'OPTIONS': return app.options(route.path, handler);
  case 'HEAD': return app.head(route.path, handler);
  case 'TRACE': return app.trace(route.path, handler);
  case 'CONNECT': return app.connect(route.path, handler);
  case 'ANY': return app.any(route.path, handler);
  }
}