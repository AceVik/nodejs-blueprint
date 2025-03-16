import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class URITooLongError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.URI_TOO_LONG, message);
  }
}
