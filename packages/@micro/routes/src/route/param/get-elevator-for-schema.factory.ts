import { type ZodSchema, ZodArray, ZodBigInt, ZodBoolean, ZodNumber, ZodObject, ZodUnion } from 'zod';
import type { ElevationHandler } from './route-param.class.js';
import type { AdapterType } from './adapters/index.js';
import { schemaHasPreprocessor, tryParse } from '../../utils/index.js';

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

export function getElevatorForSchema<T>(schema: ZodSchema<T>, adapterType: AdapterType): ElevationHandler<T, 'first' | 'last' | 'all'> | undefined {
  if (schemaHasPreprocessor<T>(schema))
    return undefined;

  if (adapterType === 'all'){
    const innerElevator = getElevatorForSchema((schema as ZodArray<never, never>).element, 'first') as ElevationHandler<T, 'first' | 'last'> | undefined;
    if (!innerElevator) return undefined;

    return arrayInnerElevator(innerElevator) as ElevationHandler<T, 'all'>;
  }

  if (schema instanceof ZodNumber)
    return numberElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodBoolean)
    return booleanElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof Date)
    return dateElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodBigInt)
    return bigIntElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodArray)
    return arrayOrObjectElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodObject)
    return arrayOrObjectElevator as ElevationHandler<T, 'first' | 'last'>;

  if (schema instanceof ZodUnion) {
    const elevators = schema.options.map((option: ZodSchema) => getElevatorForSchema(option, adapterType)).filter(Boolean) as ElevationHandler<T, 'first' | 'last'>[];
    if (!elevators.length) return undefined;
    return unionElevator(elevators) as ElevationHandler<T, 'first' | 'last'>;
  }

  // No elevator found
  return undefined;
}