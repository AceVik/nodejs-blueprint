import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class PaymentRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PAYMENT_REQUIRED, message);
  }
}