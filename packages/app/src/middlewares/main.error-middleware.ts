import { errorMiddleware, getStatusBuffer, HttpError } from '@micro/routes';

export const httpErrorMiddleware = errorMiddleware(
  (err, { rawRes, next }) => {
    console.log(err, rawRes, next);
    if (err instanceof HttpError) {
      rawRes.writeStatus(getStatusBuffer(err.status));
      rawRes.end(err.message);
      return;
    }

    next();
  });