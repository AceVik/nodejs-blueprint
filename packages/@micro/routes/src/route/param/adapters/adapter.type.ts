import type { Request } from '../../../http/index.js';

export const adapterTypes = ['last', 'first', 'all'] as const;
export type AdapterType = typeof adapterTypes[number];

export type RouteParamAdapter<T> = (req: Request) => T;