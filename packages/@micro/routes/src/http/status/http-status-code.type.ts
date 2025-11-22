import { $HttpStatus, HttpStatus } from './http-status.enum.js';

export type HttpStatusCode = typeof HttpStatus[keyof typeof HttpStatus];

export type HttpStatusRange = typeof $HttpStatus[keyof typeof $HttpStatus];

export type HttpStatusAny = HttpStatusCode | HttpStatusRange;