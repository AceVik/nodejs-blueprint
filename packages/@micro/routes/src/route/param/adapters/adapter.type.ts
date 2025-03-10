import type { ZodSchema } from 'zod';
import type { Request } from '@micro/routes/http';

export const adapterTypes = ['last', 'first', 'pick', 'all', 'filter'] as const;
export type AdapterType = typeof adapterTypes[number];

export type RouteParamAdapter<T> = (req: Request) => T | T[];
export type RouteParamAdapterPredicateArgs<TValue> = {
  value: string;
  values: string[];
  index: number;
  pick: (value: string) => void;
  use: (value: TValue) => void;
  schema: ZodSchema<TValue>;
};
export type RouteParamAdapterPredicate<TValue> = (
  args: RouteParamAdapterPredicateArgs<TValue>
) => void;