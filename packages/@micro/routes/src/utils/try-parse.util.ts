import { InvalidJsonError } from '../errors/invalid-json.error.js';

export function tryParse<T>(value: string | null | undefined): T | null | undefined {
  if (!value) {
    return value as null | undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    throw new InvalidJsonError();
  }
}