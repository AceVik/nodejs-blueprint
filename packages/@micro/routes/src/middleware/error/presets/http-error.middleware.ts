import { errorMiddleware } from '../error-middleware.factory.js';
import { RouteError, RouteErrorSchema } from '../../../route/error.type.js';
import { $HttpStatus, getStatusBuffer, HttpError } from '../../../http/index.js';
import { HTTP_ERROR_MIDDLEWARE } from '../symbols.js';

export const httpErrorMiddleware = errorMiddleware(
  HTTP_ERROR_MIDDLEWARE,
  {
    [$HttpStatus.$4XX]: RouteErrorSchema,
    [$HttpStatus.$5XX]: RouteErrorSchema,
  },
  (err, { rawRes, next }) => {
    if (err instanceof HttpError) {
      rawRes.writeStatus(getStatusBuffer(err.status));
      rawRes.writeHeader('Content-Type', 'application/json');
      rawRes.end(JSON.stringify({
        status: err.status,
        statusPhrase: err.statusPhrase,
        message: err.message,
        errors: err.errors,
      } satisfies RouteError));
      return;
    }

    next();
  },
);