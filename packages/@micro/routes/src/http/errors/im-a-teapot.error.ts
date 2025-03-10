import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class ImATeapotError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.IM_A_TEAPOT, message);
  }
}
