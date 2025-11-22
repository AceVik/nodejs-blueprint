import { z } from 'zod';

export const HttpErrorErrorsSchema = z
  .array(
    z.union([
      z.string().openapi({
        description: 'A simple error message string',
      }),
      z.record(z.string(), z.unknown()).openapi({
        description: 'A structured error object (key-value pairs)',
      }),
    ]),
  )
  .optional()
  .openapi({
    description: 'List of validation errors or detailed context',
    example: ['Field "email" is invalid', { field: 'password', code: 'too_short' }],
  });

export type HttpErrorErrors = z.infer<typeof HttpErrorErrorsSchema>;