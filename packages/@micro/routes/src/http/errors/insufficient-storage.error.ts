import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class InsufficientStorageError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.INSUFFICIENT_STORAGE, message);
  }
}
