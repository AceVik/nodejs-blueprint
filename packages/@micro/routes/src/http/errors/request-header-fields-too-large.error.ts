import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class RequestHeaderFieldsTooLargeError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE, message);
  }
}
