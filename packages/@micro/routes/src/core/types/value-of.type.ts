/**
 * ValueOf<T> yields a union of the value types of an object or array T.
 */
export type ValueOf<T> = T[keyof T];
