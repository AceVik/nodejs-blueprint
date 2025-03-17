import { BaseError } from './base.error.js';

export class InvalidJsonError extends BaseError {
  constructor(message?: string) {
    super(`Invalid JSON${message ? `: ${message}` : ''}`);
  }
}