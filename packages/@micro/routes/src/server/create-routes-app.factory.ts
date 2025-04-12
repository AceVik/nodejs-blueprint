import type { CreateRoutesAppOptions } from './create-routes-app-params.type.js';
import { RoutesApp } from './routes-app.class.js';

export function createRoutesApp(options?: CreateRoutesAppOptions): RoutesApp {
  return new RoutesApp(options);
}