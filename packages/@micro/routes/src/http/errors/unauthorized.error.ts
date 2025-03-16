import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}