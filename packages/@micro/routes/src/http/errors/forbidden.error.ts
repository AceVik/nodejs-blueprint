import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class ForbiddenError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.FORBIDDEN, message);
  }
}