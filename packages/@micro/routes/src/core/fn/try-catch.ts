import { Result } from '../result/index.js';

/**
 * Wraps a synchronous computation into a Result without throwing.
 */
export function tryCatch<T>(thunk: () => T): Result<T> {
  try {
    return Result.ok(thunk());
  } catch (e) {
    return Result.fail('Operation failed', e);
  }
}
