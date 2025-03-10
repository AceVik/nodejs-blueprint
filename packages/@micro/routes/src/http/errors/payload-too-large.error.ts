import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class PayloadTooLargeError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PAYLOAD_TOO_LARGE, message);
  }
}
