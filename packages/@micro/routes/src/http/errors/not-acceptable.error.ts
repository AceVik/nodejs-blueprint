import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class NotAcceptableError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.NOT_ACCEPTABLE, message);
  }
}
