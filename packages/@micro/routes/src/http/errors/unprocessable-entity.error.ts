import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class UnprocessableEntityError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message);
  }
}
