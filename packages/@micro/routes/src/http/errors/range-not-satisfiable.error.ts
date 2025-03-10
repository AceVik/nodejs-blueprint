import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class RangeNotSatisfiableError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.RANGE_NOT_SATISFIABLE, message);
  }
}
