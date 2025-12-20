/**
 * Extracts keys of T whose values are assignable to U.
 */
export type KeysOfType<T, U> = { [K in keyof T]-?: T[K] extends U ? K : never }[keyof T];
