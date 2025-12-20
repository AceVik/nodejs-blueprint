export const tryImport = async <T = Record<string, any>>(path: string): Promise<T | undefined> => {
  try {
    return await import(path);
  } catch (err) {
    // Intentionally swallow dynamic import errors and return undefined
    // to enable optional middleware discovery without failing startup.
    return undefined;
  }
};
