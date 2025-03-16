import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class UnavailableForLegalReasonsError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS, message);
  }
}
