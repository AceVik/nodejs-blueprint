import { httpErrorMiddleware } from './main.error-middleware.js';
import { testErrorMiddleware } from '@app/middlewares/test.error-middleware.js';
import { errorMiddlewares, HTTP_ERROR_MIDDLEWARE, SERVER_ERROR_MIDDLEWARE } from '@micro/routes/middleware';

export {
  httpErrorMiddleware,
  testErrorMiddleware,
};

export default errorMiddlewares(
  testErrorMiddleware,
  HTTP_ERROR_MIDDLEWARE,
  SERVER_ERROR_MIDDLEWARE,
);