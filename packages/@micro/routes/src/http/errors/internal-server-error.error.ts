import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
