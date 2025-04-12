import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';
import type { HttpErrorErrors } from './http-error-errors.type.js';

export class UnavailableForLegalReasonsError extends HttpError {
  constructor(message?: string, errors?: HttpErrorErrors) {
    super(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS, message, errors);
  }
}
