/**
 * Ensures the input is returned as an array. If it's already an array, returns it unchanged.
 */
export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
