import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}