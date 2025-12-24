import { DomainErrors } from './error-handling.types.js';

/**
 * A wrapper class for domain error to HTTP status mappings.
 * Used to register custom error codes via app.use().
 */
export class DomainErrorMap {
  constructor(public readonly map: DomainErrors) {}
}

/**
 * Helper function to create a DomainErrorMap.
 */
export function domainErrors(map: DomainErrors): DomainErrorMap {
  return new DomainErrorMap(map);
}

export function isDomainErrorMap(value: unknown): value is DomainErrorMap {
  return value instanceof DomainErrorMap;
}