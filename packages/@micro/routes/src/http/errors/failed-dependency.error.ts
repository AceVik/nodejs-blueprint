import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class FailedDependencyError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.FAILED_DEPENDENCY, message);
  }
}
