import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class ProxyAuthenticationRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PROXY_AUTHENTICATION_REQUIRED, message);
  }
}
