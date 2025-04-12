import { httpErrorMiddleware } from './main.error-middleware.js';
import { testErrorMiddleware } from '@app/middlewares/test.error-middleware.js';
import { errorMiddlewares } from '@micro/routes';
import { HTTP_ERROR_MIDDLEWARE, SERVER_ERROR_MIDDLEWARE } from '@micro/routes/lib/middleware/error/symbols.js';

export {
  httpErrorMiddleware,
  testErrorMiddleware,
};

export default errorMiddlewares(
  testErrorMiddleware,
  HTTP_ERROR_MIDDLEWARE,
  SERVER_ERROR_MIDDLEWARE,
);