import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';
import type { HttpErrorErrors } from './http-error-errors.type.js';

export class ProxyAuthenticationRequiredError extends HttpError {
  constructor(message?: string, errors?: HttpErrorErrors) {
    super(HttpStatus.PROXY_AUTHENTICATION_REQUIRED, message, errors);
  }
}
