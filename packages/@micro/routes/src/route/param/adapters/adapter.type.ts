import type { Request } from '../../../http/index.js';
import { ElevationHandler } from '../route-param.class.js';

export const adapterTypes = ['last', 'first', 'all'] as const;
export type AdapterType = typeof adapterTypes[number];

type ValueKind = 'raw' | 'elevated' | 'validated';

export type RouteParamAdapter<T, AP extends AdapterType = any> = (req: Request, kind: ValueKind, elevationHandler?: ElevationHandler<T, AP>) => T;