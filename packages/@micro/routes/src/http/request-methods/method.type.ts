import '../../setup/openapi.js';
import { z } from 'zod';
import * as MethodValues from './methods.js';

/**
 * Acts as a namespace for accessing HTTP method constants at runtime.
 * Usage: RequestMethod.GET, RequestMethod.POST
 */
export const RequestMethod = MethodValues;

/**
 * A readonly tuple containing all supported HTTP request methods.
 * Useful for runtime validation, iteration, or type narrowing.
 */
export const requestMethods = [
  RequestMethod.GET,
  RequestMethod.POST,
  RequestMethod.PUT,
  RequestMethod.PATCH,
  RequestMethod.DELETE,
  RequestMethod.OPTIONS,
  RequestMethod.HEAD,
  RequestMethod.CONNECT,
  RequestMethod.TRACE,
] as const;

/**
 * Zod schema validation for HTTP request methods.
 * Ensures the value is one of the standard HTTP methods (GET, POST, etc.).
 *
 * Automatically generates an OpenAPI Enum definition with the ID 'RequestMethod'.
 */
export const requestMethodSchema = z.enum(requestMethods).openapi('RequestMethod', {
  title: 'RequestMethod',
  description: 'Standard HTTP request method.',
  example: 'GET',
});

/**
 * Represents a union type of all supported HTTP request methods.
 * Equivalent to 'GET' | 'POST' | 'PUT' | ...
 *
 * Usage: const method: RequestMethod = RequestMethod.GET;
 */
export type RequestMethod = z.infer<typeof requestMethodSchema>;