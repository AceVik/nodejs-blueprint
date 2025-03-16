import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
