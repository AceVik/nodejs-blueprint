import { z } from 'zod';
import { HttpStatus } from '../http/index.js';
import { HttpErrorErrorsSchema } from '../http/errors/http-error-errors.type.js';

export const RouteErrorSchema = z.object({
  status: z.number().int().min(HttpStatus.MIN).max(HttpStatus.MAX).openapi({
    description: 'The HTTP status code',
    example: HttpStatus.BAD_REQUEST,
  }),
  statusPhrase: z.string().openapi({
    description: 'The standard HTTP status phrase',
    example: 'Bad Request',
  }),
  messages: HttpErrorErrorsSchema,
}).openapi(
  'RouteError',
  {
    description: 'Standardized error response structure',
  },
);

export type RouteError = z.infer<typeof RouteErrorSchema>;