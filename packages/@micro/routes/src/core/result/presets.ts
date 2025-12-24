import { err } from './result-error.type.js';

/**
 * Standard domain error codes used by Result factory methods.
 * These are mapped to HTTP status codes in the HTTP layer (resultNormalizer).
 */
export const CommonErrorCodes = {
  NOT_FOUND: err`RESOURCE_NOT_FOUND`,
  ALREADY_EXISTS: err`RESOURCE_ALREADY_EXISTS`,
  INVALID_OPERATION: err`INVALID_OPERATION`,
  VALIDATION_FAILED: err`VALIDATION_FAILED`,
  PERMISSION_DENIED: err`PERMISSION_DENIED`,
  INTERNAL_ERROR: err`INTERNAL_ERROR`,
} as const;