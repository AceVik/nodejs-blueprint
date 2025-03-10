import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class ExpectationFailedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.EXPECTATION_FAILED, message);
  }
}
