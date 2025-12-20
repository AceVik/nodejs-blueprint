/**
 * Extracts keys from T whose values are non-nullable (not null and not undefined).
 */
export type NonNullableKeys<T> = {
  [K in keyof T]-?: null extends T[K]
    ? never
    : undefined extends T[K]
      ? never
      : K
}[keyof T];
