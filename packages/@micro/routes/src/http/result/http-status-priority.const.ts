import { HttpStatus, type HttpStatusCode } from '../status/index.js';

/**
 * Priority list of HTTP status codes for error resolution.
 * Used by HttpResult.fromResult to determine the most significant error.
 * Higher priority items are checked first.
 */
export const STATUS_PRIORITY: readonly HttpStatusCode[] = [
  HttpStatus.INTERNAL_SERVER_ERROR, // 500
  HttpStatus.SERVICE_UNAVAILABLE,   // 503
  HttpStatus.NOT_IMPLEMENTED,       // 501
  HttpStatus.FORBIDDEN,             // 403
  HttpStatus.UNAUTHORIZED,          // 401
  HttpStatus.NOT_ACCEPTABLE,        // 406
  HttpStatus.METHOD_NOT_ALLOWED,    // 405
  HttpStatus.NOT_FOUND,             // 404
  HttpStatus.CONFLICT,              // 409
  HttpStatus.UNPROCESSABLE_ENTITY,  // 422
  HttpStatus.PAYMENT_REQUIRED,      // 402
  HttpStatus.BAD_REQUEST,           // 400
];