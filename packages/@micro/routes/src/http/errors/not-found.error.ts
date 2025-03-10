import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(HttpStatus.NOT_FOUND, message);
  }
}