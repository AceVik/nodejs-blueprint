import z from 'zod';
import type { Brand } from '../types/brand.type.js';

/**
 * A branded type for Error Codes to ensure type safety.
 * Prevents passing arbitrary strings where an error code is expected.
 */
export type ErrorCode = Brand<string, 'ErrorCode'>;

/**
 * Tagged Template Literal helper for ErrorCodes.
 * Usage: const MY_ERR = err`MY_ERR`;
 */
export function err(strings: TemplateStringsArray): ErrorCode {
  return strings[0] as ErrorCode;
}

/**
 * The payload structure for errors.
 * Enforces a machine-readable code.
 */
export type ErrorPayload<T = unknown> = {
  code: ErrorCode;
  details?: T;
};



export const ErrorPayloadSchema = z
  .object({
    code: z.string().openapi({
      description: 'Machine-readable error code for status mapping',
      example: 'VALIDATION_INVALID_EMAIL',
    }),
    details: z.unknown().optional().openapi({
      description: 'Additional structured context',
    }),
  })
  .optional()
  .openapi({
    description: 'Structured error payload. Present if type is error.',
  });