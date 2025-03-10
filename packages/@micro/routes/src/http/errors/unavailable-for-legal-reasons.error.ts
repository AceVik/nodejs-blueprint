import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class UnavailableForLegalReasonsError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS, message);
  }
}
