import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class ServiceUnavailableError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message);
  }
}
