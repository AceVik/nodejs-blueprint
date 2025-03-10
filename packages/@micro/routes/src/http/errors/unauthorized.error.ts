import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}