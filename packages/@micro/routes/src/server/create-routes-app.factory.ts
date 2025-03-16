import { CreateRoutesAppOptions } from './create-routes-app-params.type.js';
import { RoutesAppPreset } from './routes-app-preset.class.js';

export function createRoutesApp(options?: CreateRoutesAppOptions): RoutesAppPreset {
  return new RoutesAppPreset(options || {});
}