import { httpErrorMiddleware } from './main.error-middleware.js';
import { testErrorMiddleware } from '@app/middlewares/test.error-middleware.js';
import { HTTP_ERROR_MIDDLEWARE, SERVER_ERROR_MIDDLEWARE } from '@micro/routes/middleware';
import { errorMiddlewares } from '@micro/routes/lib/middleware/error/test.js';

export {
  httpErrorMiddleware,
  testErrorMiddleware,
};

export default errorMiddlewares(
  testErrorMiddleware,
  HTTP_ERROR_MIDDLEWARE,
  SERVER_ERROR_MIDDLEWARE,
);