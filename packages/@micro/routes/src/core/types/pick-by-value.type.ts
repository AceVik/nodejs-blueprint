/**
 * Picks properties from T whose value types are assignable to U.
 */
export type PickByValue<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
};
