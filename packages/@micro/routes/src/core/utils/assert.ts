/**
 * Asserts a condition is truthy. Narrows the type on success; throws on failure.
 */
export function assert(condition: unknown, message = 'Assertion failed'): asserts condition {
  if (!condition) throw new Error(message);
}

/**
 * Asserts exhaustive checks for discriminated unions.
 */
export function assertNever(x: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${String(x)}`);
}
