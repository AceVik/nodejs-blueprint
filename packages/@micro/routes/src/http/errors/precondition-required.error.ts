import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class PreconditionRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PRECONDITION_REQUIRED, message);
  }
}
