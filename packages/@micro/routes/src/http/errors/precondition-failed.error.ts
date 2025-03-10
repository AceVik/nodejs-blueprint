import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class PreconditionFailedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PRECONDITION_FAILED, message);
  }
}
