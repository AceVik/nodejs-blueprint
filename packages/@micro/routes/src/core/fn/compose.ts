/**
 * Composes unary functions right-to-left.
 */
export function compose<T>(...fns: Array<(x: any) => any>) {
  return (value: T) => fns.reduceRight((acc, fn) => fn(acc), value);
}
