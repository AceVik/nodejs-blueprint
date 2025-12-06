import { HttpStatus } from '@micro/routes';
import { z } from 'zod';
import { errorMiddleware } from '@micro/routes/middleware';

export const testErrorMiddleware = errorMiddleware(
  {
    [HttpStatus.INTERNAL_SERVER_ERROR]: z.object(), // Error response object like json structure or just z.string()
  },
  (err, { rawRes, next }) => {
    if (err instanceof Error) {
      rawRes.writeStatus('500 Internal Server Error');
      rawRes.end(err.message);
      return;
    }

    next();
  },
);