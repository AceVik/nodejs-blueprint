import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';
import type { HttpErrorErrors } from './http-error-errors.type.js';

export class GatewayTimeoutError extends HttpError {
  constructor(message?: string, errors?: HttpErrorErrors) {
    super(HttpStatus.GATEWAY_TIMEOUT, message, errors);
  }
}
