import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';
import type { HttpErrorErrors } from './http-error-errors.type.js';

export class PayloadTooLargeError extends HttpError {
  constructor(message?: string, errors?: HttpErrorErrors) {
    super(HttpStatus.PAYLOAD_TOO_LARGE, message, errors);
  }
}
