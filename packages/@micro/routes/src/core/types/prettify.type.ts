/**
 * Forces TypeScript to display the full expanded type instead of an intersection.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
