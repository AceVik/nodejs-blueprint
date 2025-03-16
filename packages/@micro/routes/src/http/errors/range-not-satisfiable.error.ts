import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class RangeNotSatisfiableError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.RANGE_NOT_SATISFIABLE, message);
  }
}
