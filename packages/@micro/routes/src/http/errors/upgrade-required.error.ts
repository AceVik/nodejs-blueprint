import { HttpStatus } from '@micro/routes/http/status';
import { HttpError } from './http.error';

export class UpgradeRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UPGRADE_REQUIRED, message);
  }
}
