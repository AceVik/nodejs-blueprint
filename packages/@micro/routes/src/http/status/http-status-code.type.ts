import { HttpStatus } from './http-status.enum.js';

export type HttpStatusCode = typeof HttpStatus[keyof typeof HttpStatus];