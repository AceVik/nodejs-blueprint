import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class HttpVersionNotSupportedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.HTTP_VERSION_NOT_SUPPORTED, message);
  }
}
