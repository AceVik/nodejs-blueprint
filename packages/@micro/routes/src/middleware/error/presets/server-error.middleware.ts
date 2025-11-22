import { type RouteError, RouteErrorSchema } from '../../../route/error.type.js';
import { errorMiddleware } from '../error-middleware.factory.js';
import { getStatusBuffer, getStatusPhrase, HttpStatus } from '../../../http/index.js';
import { SERVER_ERROR_MIDDLEWARE } from '../symbols.js';

const IS_PRODUCTION = process.env['NODE_ENV'] === 'production';

export const serverErrorMiddleware = errorMiddleware(
  SERVER_ERROR_MIDDLEWARE,
  {
    [HttpStatus.INTERNAL_SERVER_ERROR]: RouteErrorSchema,
  },
  (err, { rawRes }) => {
    rawRes.writeStatus(getStatusBuffer(HttpStatus.INTERNAL_SERVER_ERROR));
    rawRes.writeHeader('Content-Type', 'application/json');

    const errorDetails: RouteError = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      statusPhrase: getStatusPhrase(HttpStatus.INTERNAL_SERVER_ERROR),
      message: 'Internal Server Error',
    };

    if (err instanceof Error) {
      errorDetails.message = err.message;
      if (!IS_PRODUCTION && err.stack) {
        errorDetails.errors = [err.stack];
      }
    } else {
      try {
        errorDetails.message = JSON.stringify(err);
      } catch {
        errorDetails.message = 'Unknown Error (Circular Structure)';
      }
    }

    rawRes.end(JSON.stringify(errorDetails));
  },
);