/**
 * Executes an effect with the given value and returns the same value.
 */
export function tap<T>(value: T, effect: (v: T) => void): T {
  effect(value);
  return value;
}
