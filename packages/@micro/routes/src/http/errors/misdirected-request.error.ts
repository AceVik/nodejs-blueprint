import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class MisdirectedRequestError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.MISDIRECTED_REQUEST, message);
  }
}
