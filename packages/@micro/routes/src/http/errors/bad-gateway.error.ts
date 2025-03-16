import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class BadGatewayError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.BAD_GATEWAY, message);
  }
}
