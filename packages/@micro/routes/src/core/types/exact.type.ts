/**
 * Ensures U does not contain extra properties beyond T.
 */
export type Exact<T, U extends T> = T & { [K in Exclude<keyof U, keyof T>]: never };
