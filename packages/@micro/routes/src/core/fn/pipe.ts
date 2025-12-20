/**
 * Pipes a value through a sequence of unary functions left-to-right.
 */
export function pipe<T>(value: T, ...fns: Array<(x: any) => any>) {
  return fns.reduce((acc, fn) => fn(acc), value);
}
