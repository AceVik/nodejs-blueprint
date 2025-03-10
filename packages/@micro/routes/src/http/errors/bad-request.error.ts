import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}