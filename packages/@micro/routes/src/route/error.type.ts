import type { HttpStatusCode } from '../http/index.js';
import type { HttpErrorErrors } from '../http/errors/http-error-errors.type.js';

export type RouteError = {
  status: HttpStatusCode;
  statusPhrase: string;
  message: string;
  errors?: HttpErrorErrors;
};