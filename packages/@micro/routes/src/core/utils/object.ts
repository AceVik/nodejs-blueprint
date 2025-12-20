/**
 * Picks a subset of properties from an object.
 */
export function pick<T extends object, K extends readonly (keyof T)[]>(obj: T, keys: K): Pick<T, K[number]> {
  const out: any = {};
  for (const k of keys) {
    if (k in obj) out[k] = (obj as any)[k];
  }
  return out;
}

/**
 * Omits a subset of properties from an object.
 */
export function omit<T extends object, K extends readonly (keyof T)[]>(obj: T, keys: K): Omit<T, K[number]> {
  const out: any = {};
  const skip = new Set(keys as readonly string[]);
  for (const k in obj as any) {
    if (!skip.has(k)) out[k] = (obj as any)[k];
  }
  return out;
}
