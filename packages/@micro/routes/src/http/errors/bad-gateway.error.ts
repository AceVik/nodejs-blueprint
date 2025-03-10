import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class BadGatewayError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.BAD_GATEWAY, message);
  }
}
