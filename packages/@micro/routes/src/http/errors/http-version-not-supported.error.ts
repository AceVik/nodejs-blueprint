import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class HttpVersionNotSupportedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.HTTP_VERSION_NOT_SUPPORTED, message);
  }
}
