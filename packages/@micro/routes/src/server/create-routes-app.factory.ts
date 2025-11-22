import type { CreateRoutesAppOptions } from './create-routes-app-params.type.js';
import { RoutesApp } from './routes-app.class.js';

/**
 * Factory function to create a new instance of RoutesApp.
 * 
 * @param options - Configuration options for the RoutesApp.
 * @returns A new RoutesApp instance.
 */
export function createRoutesApp(options?: CreateRoutesAppOptions): RoutesApp {
  return new RoutesApp(options);
}