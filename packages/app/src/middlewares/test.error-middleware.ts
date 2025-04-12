import { errorMiddleware } from '@micro/routes';

export const testErrorMiddleware = errorMiddleware(
  (err, { rawRes, next }) => {
    console.log('testErrorMiddleware', err);

    if (err instanceof Error) {
      rawRes.writeStatus('500 Internal Server Error');
      rawRes.end(err.message);
      return;
    }

    next();
  },
);