/**
 * Brand utility to create nominally distinct types based on the same underlying representation.
 * Example: `type UserId = Brand<string, 'UserId'>;`
 */
export type Brand<T, TBrand extends string> = T & { readonly __brand: TBrand };
