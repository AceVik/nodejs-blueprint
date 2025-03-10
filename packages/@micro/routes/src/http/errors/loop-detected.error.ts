import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class LoopDetectedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.LOOP_DETECTED, message);
  }
}
