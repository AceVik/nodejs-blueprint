import { ZodEffects, type ZodSchema } from 'zod';

export function schemaHasPreprocessor<T>(schema: ZodSchema<T>): boolean {
  if (schema instanceof ZodEffects) {
    return schema._def.effect.type === 'preprocess';
  }

  return false;
}