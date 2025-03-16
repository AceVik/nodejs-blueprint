import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class TooManyRequestsError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.TOO_MANY_REQUESTS, message);
  }
}
