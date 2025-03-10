import { HttpStatus } from './http-status.enum';

export type HttpStatusCode = typeof HttpStatus[keyof typeof HttpStatus];