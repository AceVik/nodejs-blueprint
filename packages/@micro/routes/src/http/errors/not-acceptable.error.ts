import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class NotAcceptableError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.NOT_ACCEPTABLE, message);
  }
}
