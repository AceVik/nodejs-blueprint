import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class ConflictError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.CONFLICT, message);
  }
}
