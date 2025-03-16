import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class PayloadTooLargeError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PAYLOAD_TOO_LARGE, message);
  }
}
