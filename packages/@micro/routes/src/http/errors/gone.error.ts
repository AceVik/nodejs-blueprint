import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class GoneError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.GONE, message);
  }
}
