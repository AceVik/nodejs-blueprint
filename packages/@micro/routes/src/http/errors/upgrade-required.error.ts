import { HttpStatus } from '../../http/index.js';
import { HttpError } from './http.error.js';

export class UpgradeRequiredError extends HttpError {
  constructor(message?: string) {
    super(HttpStatus.UPGRADE_REQUIRED, message);
  }
}
