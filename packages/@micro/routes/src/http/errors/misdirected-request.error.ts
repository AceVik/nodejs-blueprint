import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class MisdirectedRequestError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.MISDIRECTED_REQUEST, message);
  }
}
