import type { Request } from '../../../http/index.js';
import { ElevationHandler } from '../route-param.class.js';

export const adapterTypes = ['last', 'first', 'all'] as const;
export type AdapterType = typeof adapterTypes[number];

export type RouteParamAdapter<T, AP extends AdapterType = any> = (req: Request, elevationHandler?: ElevationHandler<T, AP>) => T;