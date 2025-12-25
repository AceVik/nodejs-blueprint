import { Result } from '../result/index.js';
import { CommonErrorCodes } from '../result/presets.js';

/**
 * Wraps a synchronous computation into a Result without throwing.
 */
export function tryCatch<T>(thunk: () => T): Result<T> {
  try {
    return Result.ok(thunk());
  } catch (e) {
    return Result.fail('Operation failed', CommonErrorCodes.INTERNAL_ERROR, 'Exception', e);
  }
}
