export const tryImport = async <T = Record<string, any>>(path: string): Promise<T | undefined> => {
  try {
    return await import(path);
  } catch (err) {
    console.log('tryImport failed', path, err);
    return undefined;
  }
};