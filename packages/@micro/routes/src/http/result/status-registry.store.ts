import { HttpStatus, type HttpStatusCode } from '../status/index.js';
import { CommonErrorCodes } from '../../core/result/presets.js';
import type { ErrorCode } from '../../core/result/index.js';
import type { DomainErrors } from './error-handling.types.js';

// --- INTERNAL REGISTRY ---
const STATUS_REGISTRY: DomainErrors = {
  [CommonErrorCodes.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [CommonErrorCodes.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [CommonErrorCodes.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [CommonErrorCodes.VALIDATION_FAILED]: HttpStatus.BAD_REQUEST,
  [CommonErrorCodes.INVALID_OPERATION]: HttpStatus.BAD_REQUEST,
  [CommonErrorCodes.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
};

// --- PUBLIC API ---

/**
 * Registers new mappings globally.
 * Overwrites existing keys if they exist.
 * @param map - The new mappings.
 */
export function registerStatusMap(map: DomainErrors): void {
  Object.assign(STATUS_REGISTRY, map);
}

/**
 * Resolves an error code to an HTTP status.
 * Returns undefined if no mapping exists.
 * @param code - The error code.
 * @param personalErrors - Optional custom error mappings.
 */
export function resolveHttpStatus(code: ErrorCode, personalErrors?: DomainErrors): HttpStatusCode | undefined {
  return personalErrors?.[code] ?? STATUS_REGISTRY[code];
}