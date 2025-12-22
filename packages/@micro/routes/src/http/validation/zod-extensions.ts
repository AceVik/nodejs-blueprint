import '../../setup/openapi.js';
import { z } from 'zod';
import type { Streamable } from '../../core/index.js';

/**
 * Zod schema for File objects (e.g. from FormData or defined manually).
 * Maps to OpenAPI type: string, format: binary.
 */
export const fileSchema = () =>
  z.custom<File>((val) => {
    return val && typeof val === 'object' && 'name' in val && 'stream' in val;
  }, 'Expected a File')
    .openapi({
      type: 'string',
      format: 'binary',
    });

/**
 * Zod schema for Streamable content.
 * Maps to OpenAPI type: string, format: binary.
 */
export const streamSchema = () =>
  z.custom<Streamable>((val) => {
    return val !== null && val !== undefined;
  }, 'Expected a Stream')
    .openapi({
      type: 'string',
      format: 'binary',
    });