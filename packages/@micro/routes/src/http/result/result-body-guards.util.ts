import { Readable } from 'node:stream';
import type { JsonArray, JsonObject } from '../../core/index.js';

/**
 * Represents a plain object or array body (POJO).
 * Strictly excludes primitives, null, undefined, streams, and binary buffers.
 */
export type ObjectBody = JsonObject | JsonArray;

/**
 * Checks if the body is null or undefined.
 */
export const isEmptyBody = (body: unknown): body is null | undefined => {
  return body === null || body === undefined;
};

/**
 * Checks if the body is a raw string.
 */
export const isPlainTextBody = (body: unknown): body is string => {
  return typeof body === 'string';
};

/**
 * Checks if the body is binary data (Buffer, Uint8Array, Blob, File).
 */
export const isFileBody = (body: unknown): body is Uint8Array | Buffer | Blob | File => {
  return (
    body instanceof Uint8Array ||
    Buffer.isBuffer(body) ||
    (typeof Blob !== 'undefined' && body instanceof Blob) // File extends Blob
  );
};

/**
 * Checks if the body is a stream (Node.js Readable or Web ReadableStream).
 */
export const isStreamableBody = (body: unknown): body is Readable | ReadableStream => {
  return (
    body instanceof Readable ||
    (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) ||
    (!!body && typeof (body as any).pipe === 'function')
  );
};

/**
 * Checks if the body is strictly a plain object or array (ObjectBody).
 * Returns true ONLY for JsonObject | JsonArray.
 * Returns false for: null, undefined, string, number, boolean, Buffer, Stream, File.
 */
export const isObjectBody = (body: unknown): body is ObjectBody => {
  // 1. Exclude null/undefined explicitly
  if (isEmptyBody(body)) return false;

  // 2. Exclude primitives (string, number, boolean, symbol, function)
  if (typeof body !== 'object') return false;

  // 3. Exclude binary/stream types (technically objects in JS)
  if (isFileBody(body)) return false;
  if (isStreamableBody(body)) return false;

  // 4. What remains is a non-null plain object or array.
  return true;
};