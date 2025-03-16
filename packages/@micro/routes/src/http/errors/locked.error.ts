import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class LockedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.LOCKED, message);
  }
}
