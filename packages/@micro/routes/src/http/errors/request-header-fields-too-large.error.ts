import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';
import type { HttpErrorErrors } from './http-error-errors.type.js';

export class RequestHeaderFieldsTooLargeError extends HttpError {
  constructor(message?: string, errors?: HttpErrorErrors) {
    super(HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE, message, errors);
  }
}
