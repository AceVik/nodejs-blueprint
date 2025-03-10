import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class PaymentRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.PAYMENT_REQUIRED, message);
  }
}