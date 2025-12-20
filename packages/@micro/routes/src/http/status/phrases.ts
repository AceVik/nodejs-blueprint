import type { RecognizedString } from 'uWebSockets.js';
import { toRecognizedString } from '../../core/utils/to-regignized-string.util.js';
import type { HttpStatusCode } from './http-status-code.type.js';
import { HttpStatus } from './http-status.enum.js';

const status2phrase = new Map<HttpStatusCode, string>([
  // Informational responses
  [HttpStatus.CONTINUE, 'Continue'],
  [HttpStatus.SWITCHING_PROTOCOLS, 'Switching Protocols'],
  [HttpStatus.PROCESSING, 'Processing'],
  [HttpStatus.EARLY_HINTS, 'Early Hints'],

  // Successful responses
  [HttpStatus.OK, 'OK'],
  [HttpStatus.CREATED, 'Created'],
  [HttpStatus.ACCEPTED, 'Accepted'],
  [HttpStatus.NON_AUTHORITATIVE_INFORMATION, 'Non-Authoritative Information'],
  [HttpStatus.NO_CONTENT, 'No Content'],
  [HttpStatus.RESET_CONTENT, 'Reset Content'],
  [HttpStatus.PARTIAL_CONTENT, 'Partial Content'],
  [HttpStatus.MULTI_STATUS, 'Multi-Status'],
  [HttpStatus.ALREADY_REPORTED, 'Already Reported'],
  [HttpStatus.IM_USED, 'IM Used'],

  // Redirection messages
  [HttpStatus.MULTIPLE_CHOICES, 'Multiple Choices'],
  [HttpStatus.MOVED_PERMANENTLY, 'Moved Permanently'],
  [HttpStatus.FOUND, 'Found'],
  [HttpStatus.SEE_OTHER, 'See Other'],
  [HttpStatus.NOT_MODIFIED, 'Not Modified'],
  [HttpStatus.USE_PROXY, 'Use Proxy'],
  [HttpStatus.UNUSED, 'Unused'],
  [HttpStatus.TEMPORARY_REDIRECT, 'Temporary Redirect'],
  [HttpStatus.PERMANENT_REDIRECT, 'Permanent Redirect'],

  // Client error responses
  [HttpStatus.BAD_REQUEST, 'Bad Request'],
  [HttpStatus.UNAUTHORIZED, 'Unauthorized'],
  [HttpStatus.PAYMENT_REQUIRED, 'Payment Required'],
  [HttpStatus.FORBIDDEN, 'Forbidden'],
  [HttpStatus.NOT_FOUND, 'Not Found'],
  [HttpStatus.METHOD_NOT_ALLOWED, 'Method Not Allowed'],
  [HttpStatus.NOT_ACCEPTABLE, 'Not Acceptable'],
  [HttpStatus.PROXY_AUTHENTICATION_REQUIRED, 'Proxy Authentication Required'],
  [HttpStatus.REQUEST_TIMEOUT, 'Request Timeout'],
  [HttpStatus.CONFLICT, 'Conflict'],
  [HttpStatus.GONE, 'Gone'],
  [HttpStatus.LENGTH_REQUIRED, 'Length Required'],
  [HttpStatus.PRECONDITION_FAILED, 'Precondition Failed'],
  [HttpStatus.PAYLOAD_TOO_LARGE, 'Payload Too Large'],
  [HttpStatus.URI_TOO_LONG, 'URI Too Long'],
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'Unsupported Media Type'],
  [HttpStatus.RANGE_NOT_SATISFIABLE, 'Range Not Satisfiable'],
  [HttpStatus.EXPECTATION_FAILED, 'Expectation Failed'],
  [HttpStatus.IM_A_TEAPOT, "I'm a Teapot"],
  [HttpStatus.MISDIRECTED_REQUEST, 'Misdirected Request'],
  [HttpStatus.UNPROCESSABLE_ENTITY, 'Unprocessable Entity'],
  [HttpStatus.LOCKED, 'Locked'],
  [HttpStatus.FAILED_DEPENDENCY, 'Failed Dependency'],
  [HttpStatus.TOO_EARLY, 'Too Early'],
  [HttpStatus.UPGRADE_REQUIRED, 'Upgrade Required'],
  [HttpStatus.PRECONDITION_REQUIRED, 'Precondition Required'],
  [HttpStatus.TOO_MANY_REQUESTS, 'Too Many Requests'],
  [HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE, 'Request Header Fields Too Large'],
  [HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS, 'Unavailable For Legal Reasons'],

  // Server error responses
  [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'],
  [HttpStatus.NOT_IMPLEMENTED, 'Not Implemented'],
  [HttpStatus.BAD_GATEWAY, 'Bad Gateway'],
  [HttpStatus.SERVICE_UNAVAILABLE, 'Service Unavailable'],
  [HttpStatus.GATEWAY_TIMEOUT, 'Gateway Timeout'],
  [HttpStatus.HTTP_VERSION_NOT_SUPPORTED, 'HTTP Version Not Supported'],
  [HttpStatus.VARIANT_ALSO_NEGOTIATES, 'Variant Also Negotiates'],
  [HttpStatus.INSUFFICIENT_STORAGE, 'Insufficient Storage'],
  [HttpStatus.LOOP_DETECTED, 'Loop Detected'],
  [HttpStatus.NOT_EXTENDED, 'Not Extended'],
  [HttpStatus.NETWORK_AUTHENTICATION_REQUIRED, 'Network Authentication Required'],
]);

const status2buffer = new Map<HttpStatusCode, RecognizedString>();
for (const [status, phrase] of status2phrase.entries()) {
  status2buffer.set(status, toRecognizedString(`${status} ${phrase}`));
}

const unknownStatusPhrase = 'Unknown Status';

export const getStatusPhrase = (status: HttpStatusCode, fallbackPhrase?: string): string => {
  return status2phrase.get(status) || fallbackPhrase || unknownStatusPhrase;
};

export const getStatusBuffer = (
  status: HttpStatusCode,
  fallback?: RecognizedString,
): RecognizedString => {
  return status2buffer.get(status) || fallback || `${status} ${unknownStatusPhrase}`;
};