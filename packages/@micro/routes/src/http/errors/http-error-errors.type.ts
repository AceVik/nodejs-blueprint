import { z } from 'zod';
import { ResultMessageSchema } from '../../core/result/index.js';

export const HttpErrorErrorsSchema = z
  .array(ResultMessageSchema)
  .openapi({
    description: 'List of result messages.',
  });

export type HttpErrorErrors = z.infer<typeof HttpErrorErrorsSchema>;