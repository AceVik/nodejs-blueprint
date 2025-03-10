import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class URITooLongError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.URI_TOO_LONG, message);
  }
}
