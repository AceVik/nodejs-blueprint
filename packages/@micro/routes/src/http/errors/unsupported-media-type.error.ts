import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message);
  }
}
