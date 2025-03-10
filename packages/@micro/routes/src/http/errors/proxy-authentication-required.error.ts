import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class ProxyAuthenticationRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PROXY_AUTHENTICATION_REQUIRED, message);
  }
}
