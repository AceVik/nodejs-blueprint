import { getStatusPhrase, type HttpStatusCode } from '../../http/index.js';

export class HttpError extends Error {
  public get statusPhrase() {
    return getStatusPhrase(this.status);
  }

  constructor(public readonly status: HttpStatusCode, message?: string) {
    super(message);
  }
}