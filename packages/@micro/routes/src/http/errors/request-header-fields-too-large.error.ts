import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class RequestHeaderFieldsTooLargeError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE, message);
  }
}
