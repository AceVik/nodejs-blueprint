import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class TooEarlyError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.TOO_EARLY, message);
  }
}
