import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class NotExtendedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.NOT_EXTENDED, message);
  }
}
