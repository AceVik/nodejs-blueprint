import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class LengthRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.LENGTH_REQUIRED, message);
  }
}
