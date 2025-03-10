import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class RequestTimeoutError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.REQUEST_TIMEOUT, message);
  }
}
