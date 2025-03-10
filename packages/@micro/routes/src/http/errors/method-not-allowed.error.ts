import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class MethodNotAllowedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.METHOD_NOT_ALLOWED, message);
  }
}