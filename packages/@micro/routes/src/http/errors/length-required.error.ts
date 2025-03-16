import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class LengthRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.LENGTH_REQUIRED, message);
  }
}
