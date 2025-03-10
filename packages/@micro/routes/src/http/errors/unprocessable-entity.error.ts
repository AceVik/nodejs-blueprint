import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class UnprocessableEntityError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message);
  }
}
