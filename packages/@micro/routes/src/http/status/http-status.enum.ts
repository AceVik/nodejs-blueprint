import * as HttpStatusCodes from './codes.js';
export const HttpStatus = HttpStatusCodes;

export const $HttpStatus = {
  $1XX: '1xx',
  $2XX: '2xx',
  $3XX: '3xx',
  $4XX: '4xx',
  $5XX: '5xx',
  $XXX: 'default',
} as const;