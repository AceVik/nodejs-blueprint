import { errorMiddlewares, HTTP_ERROR_MIDDLEWARE, SERVER_ERROR_MIDDLEWARE } from '@micro/routes/middleware';

export default errorMiddlewares(
  MyErrorMwA,
  MyErrorMwB,
  MyErrorMwC,
);