import { CreateRoutesAppOptions } from './create-routes-app-params.type.ts';
import { RoutesAppPreset } from './routes-app-preset.class.ts';

export function createRoutesApp(options?: CreateRoutesAppOptions): RoutesAppPreset {
  return new RoutesAppPreset(options || {});
}