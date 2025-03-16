import { CreateRoutesAppOptions } from './create-routes-app-params.type';
import { RoutesAppPreset } from './routes-app-preset.class';

export function createRoutesApp(options?: CreateRoutesAppOptions): RoutesAppPreset {
  return new RoutesAppPreset(options || {});
}