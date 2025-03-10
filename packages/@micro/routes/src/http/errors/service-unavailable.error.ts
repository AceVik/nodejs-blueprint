import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class ServiceUnavailableError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message);
  }
}
