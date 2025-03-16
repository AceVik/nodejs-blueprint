import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class MethodNotAllowedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.METHOD_NOT_ALLOWED, message);
  }
}