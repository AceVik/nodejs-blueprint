import type { ZodSchema } from 'zod';
import type { RouteParamAdapterPredicate } from './adapter.type';

export const defaultPickPredicate: RouteParamAdapterPredicate<unknown> = ({ values, pick }) =>
  pick(values[values.length - 1]);
export const defaultFilterPredicate: RouteParamAdapterPredicate<unknown> = ({ value, pick }) =>
  pick(value);

// Helper function to apply the pick predicate over an array of values.
export function applyPickPredicate<T>(
  values: string[],
  predicate: RouteParamAdapterPredicate<T>,
  schema: ZodSchema<T>,
): T {
  for (let i = 0; i < values.length; i++) {
    let selectedValue: T | undefined;
    let stopLoop = false;
    predicate({
      value: values[i],
      values,
      index: i,
      pick: (val: string) => {
        selectedValue = schema.parse(val);
        stopLoop = true;
      },
      use: (val: T) => {
        selectedValue = val;
        stopLoop = true;
      },
      schema,
    });
    if (stopLoop && selectedValue !== undefined) {
      return selectedValue;
    }
  }
  return schema.parse(undefined);
}

// Helper function to apply the filter predicate over an array of values using a standard for-loop.
export function applyFilterPredicate<T>(
  values: string[],
  predicate: RouteParamAdapterPredicate<T>,
  schema: ZodSchema<T>,
): T[] {
  const result: T[] = [];
  for (let i = 0; i < values.length; i++) {
    predicate({
      value: values[i],
      values,
      index: i,
      pick: (val: string) => result.push(schema.parse(val)),
      use: (val: T) => result.push(val),
      schema,
    });
  }
  return result;
}