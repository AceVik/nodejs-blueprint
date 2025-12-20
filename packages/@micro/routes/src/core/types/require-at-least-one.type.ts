/**
 * Requires at least one of the specified keys to be present in T.
 */
export type RequireAtLeastOne<T, K extends keyof T = keyof T> =
  K extends keyof T
    ? Required<Pick<T, K>> & Partial<Omit<T, K>>
    : never;
