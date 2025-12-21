import { Result } from '../result/index.js';

/**
 * Converts a Promise to a Result, with optional mappers for value and error.
 */
export async function fromPromise<T, E = unknown>(
  promise: Promise<T>,
  mapValue?: (value: T) => T,
  mapError?: (err: unknown) => E,
): Promise<Result<T>> {
  try {
    const v = await promise;
    return Result.ok(mapValue ? mapValue(v) : v);
  } catch (e) {
    const mapped = mapError ? mapError(e) : (e as E);
    return Result.fail<T>('Operation failed', mapped);
  }
}
