import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class VariantAlsoNegotiatesError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.VARIANT_ALSO_NEGOTIATES, message);
  }
}
