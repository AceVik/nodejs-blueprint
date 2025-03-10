import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class NotExtendedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.NOT_EXTENDED, message);
  }
}
