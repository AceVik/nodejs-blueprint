import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class TooEarlyError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.TOO_EARLY, message);
  }
}
