import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class LoopDetectedError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.LOOP_DETECTED, message);
  }
}
