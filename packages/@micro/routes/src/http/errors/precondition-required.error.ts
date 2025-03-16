import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class PreconditionRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PRECONDITION_REQUIRED, message);
  }
}
