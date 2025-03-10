import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class GoneError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.GONE, message);
  }
}
