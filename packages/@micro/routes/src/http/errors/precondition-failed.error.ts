import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class PreconditionFailedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PRECONDITION_FAILED, message);
  }
}
