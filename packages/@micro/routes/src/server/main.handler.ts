import { NotImplementedError } from '@micro/routes/http/errors';
import { RequestHandler } from './http2/request-handler.type';

export const mainHandler: RequestHandler = (req, res) => {
  const defaultError = new NotImplementedError();
  res.statusCode = defaultError.status;
  res.end(defaultError.message || defaultError.statusPhrase);
};