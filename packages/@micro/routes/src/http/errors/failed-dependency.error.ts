import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class FailedDependencyError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.FAILED_DEPENDENCY, message);
  }
}
