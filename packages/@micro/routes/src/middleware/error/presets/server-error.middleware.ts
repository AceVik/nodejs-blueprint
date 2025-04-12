import type { RouteError } from '../../../route/error.type.js';
import { errorMiddleware } from '../error-middleware.factory.js';
import { getStatusBuffer, getStatusPhrase, HttpStatus } from '../../../http/index.js';
import { SERVER_ERROR_MIDDLEWARE } from '../symbols.js';

export const serverErrorMiddleware = errorMiddleware(
  SERVER_ERROR_MIDDLEWARE,
  (err, { rawRes }) => {
    rawRes.writeStatus(getStatusBuffer(HttpStatus.INTERNAL_SERVER_ERROR));
    rawRes.writeHeader('Content-Type', 'application/json');

    const errorDetails: RouteError = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      statusPhrase: getStatusPhrase(HttpStatus.INTERNAL_SERVER_ERROR),
      message: '',
    };

    if (err instanceof Error) {
      errorDetails.message = err.message;
      errorDetails.errors = err.stack ? [err.stack] : undefined;
    } else {
      errorDetails.message = JSON.stringify(err);
    }

    rawRes.end(JSON.stringify(errorDetails));
  },
);