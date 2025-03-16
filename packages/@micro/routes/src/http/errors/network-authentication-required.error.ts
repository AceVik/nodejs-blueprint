import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class NetworkAuthenticationRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.NETWORK_AUTHENTICATION_REQUIRED, message);
  }
}
