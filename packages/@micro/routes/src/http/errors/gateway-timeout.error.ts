import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class GatewayTimeoutError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.GATEWAY_TIMEOUT, message);
  }
}
