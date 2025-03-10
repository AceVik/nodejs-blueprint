import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class NetworkAuthenticationRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.NETWORK_AUTHENTICATION_REQUIRED, message);
  }
}
