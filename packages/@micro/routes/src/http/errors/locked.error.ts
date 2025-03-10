import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class LockedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.LOCKED, message);
  }
}
