import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class ExpectationFailedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.EXPECTATION_FAILED, message);
  }
}
