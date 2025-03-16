import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class ImATeapotError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.IM_A_TEAPOT, message);
  }
}
