/**
 * Awaitable represents a value that may be a `Promise<T>` or a plain `T`.
 * Useful for APIs that accept both sync and async handlers.
 */
export type Awaitable<T> = Promise<T> | T;
