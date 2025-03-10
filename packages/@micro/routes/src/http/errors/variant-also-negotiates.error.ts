import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class VariantAlsoNegotiatesError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.VARIANT_ALSO_NEGOTIATES, message);
  }
}
