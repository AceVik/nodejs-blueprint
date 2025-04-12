import { getStatusPhrase, type HttpStatusCode } from '../../http/index.js';
import type { HttpErrorErrors } from './http-error-errors.type.js';

export class HttpError extends Error {
  public get statusPhrase() {
    return getStatusPhrase(this.status);
  }

  constructor(public readonly status: HttpStatusCode, message?: string, public readonly errors?: HttpErrorErrors) {
    super(message);
  }
}