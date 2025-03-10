import type { ZodSchema } from 'zod';
import type { Request } from '@micro/routes/http';

const routeParamTypes = ['path', 'query', 'body', 'header', 'cookie'] as const;
export type RouteParamType = typeof routeParamTypes[number];

export type RouteParam<TValue> = {
  type: RouteParamType;
  name: string;
  schema: ZodSchema<TValue>;
  adapter: (req: Request) => TValue | TValue[];
};