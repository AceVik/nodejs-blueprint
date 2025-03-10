import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class ConflictError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.CONFLICT, message);
  }
}
