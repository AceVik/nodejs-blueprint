import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class GatewayTimeoutError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.GATEWAY_TIMEOUT, message);
  }
}
