import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class InsufficientStorageError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.INSUFFICIENT_STORAGE, message);
  }
}
