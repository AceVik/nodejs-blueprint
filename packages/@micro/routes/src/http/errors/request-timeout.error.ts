import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class RequestTimeoutError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.REQUEST_TIMEOUT, message);
  }
}
