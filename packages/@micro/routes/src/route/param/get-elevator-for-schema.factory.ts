import { type ZodType, ZodArray, ZodBigInt, ZodBoolean, ZodNumber, ZodObject, ZodUnion, ZodDate, ZodString } from 'zod';
import type { AdapterType } from './adapters/index.js';
import type { ElevationHandler } from './route-param.class.js';
import { tryParse } from '../../utils/index.js';
import { SchemaObject } from 'openapi3-ts/oas31';

const arrayInnerElevator = (innerElevator: ElevationHandler<unknown, 'first' | 'last'>): ElevationHandler<unknown, 'all'> => {
  return (values) => {
    if (!values?.length) {
      return [];
    }

    return values.map(innerElevator);
  };
};

const unionElevator = (elevators: ElevationHandler<unknown, 'first' | 'last'>[]): ElevationHandler<unknown, 'first' | 'last'> => {
  return ((value) => {
    if (!value) return value as undefined | null;
    for (const elevator of elevators) {
      const result = elevator(value);
      if (result) return result;
    }

    return value as string;
  }) as ElevationHandler<unknown, 'first' | 'last'>;
};

const arrayOrObjectElevator: ElevationHandler<unknown, 'first' | 'last'> = (value) => value ? tryParse(value) : null;

const numberElevator: ElevationHandler<number | string | null | undefined, 'first' | 'last'> = (value) => {
  const v = Number(value || undefined);
  if (Number.isNaN(v)) return value;
  return v;
};

const booleanElevator: ElevationHandler<boolean | string | null | undefined, 'first' | 'last'> = (value) => {
  if (value === 'false' || value === '0') return false;
  if (value === 'true' || value === '1' || value === '') return true;
  return value;
};

const dateElevator: ElevationHandler<Date | string | null | undefined, 'first' | 'last'> = (value) => {
  if (!value) return value as null | undefined;
  const v = new Date(value);
  if (Number.isNaN(v.getTime())) return value;
  return v;
};

const bigIntElevator: ElevationHandler<bigint | string | null | undefined, 'first' | 'last'> = (value) => {
  if (!value) return value as null | undefined;
  try {
    return BigInt(value);
  } catch {
    return value;
  }
};

export function getElevatorForSchema<T>(schema: ZodType<T>, adapterType: AdapterType): ElevationHandler<T, 'first' | 'last' | 'all'> | undefined {
  if (adapterType === 'all' && schema instanceof ZodArray) {
    const innerElevator = getElevatorForSchema(
      schema.element as ZodType,
      'first') as ElevationHandler<T, 'first' | 'last'> | undefined;
    if (!innerElevator) return undefined;

    return arrayInnerElevator(innerElevator) as ElevationHandler<T, 'all'>;
  }

  if (schema instanceof ZodNumber)
    return numberElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodBoolean)
    return booleanElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodDate)
    return dateElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodBigInt)
    return bigIntElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodArray)
    return arrayOrObjectElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodObject)
    return arrayOrObjectElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodUnion) {
    const elevators = schema.options.map((option) => getElevatorForSchema(option as ZodType, adapterType)).filter(Boolean) as ElevationHandler<T, 'first' | 'last'>[];
    if (!elevators.length) return undefined;
    return unionElevator(elevators) as ElevationHandler<T, 'first' | 'last'>;
  }

  // No elevator found
  return undefined;
}

/**
 * Helper to determine the basic OpenAPI type from a Zod Schema.
 * Useful for early validation or optimizations before full generation.
 */
export function getOpenApiTypeForSchema(schema: ZodType): SchemaObject['type'] {
  if ('unwrap' in schema && typeof schema.unwrap === 'function') {
    return getOpenApiTypeForSchema(schema.unwrap() as ZodType);
  }

  if (schema instanceof ZodString) return 'string';
  if (schema instanceof ZodNumber) return 'number';
  if (schema instanceof ZodBigInt) return 'integer';
  if (schema instanceof ZodBoolean) return 'boolean';
  if (schema instanceof ZodDate) return 'string';
  if (schema instanceof ZodArray) return 'array';
  if (schema instanceof ZodObject) return 'object';

  if (schema instanceof ZodUnion) {
    // If it's a union, we check if all options have the same type, otherwise undefined/mixed
    const types = schema.options.map((opt) => getOpenApiTypeForSchema(opt as ZodType));
    const firstType = types[0];
    return types.every((t) => t === firstType) ? firstType : undefined;
  }

  return undefined; // Default/Unknown
}