import { responseInterceptor } from '../response-interceptor.factory.js';
import { isHttpResult, isObjectBody } from '../../result/index.js';

/**
 * The default serializer.
 * Converts Objects/Arrays (ObjectBody) to JSON strings.
 * Ignores Strings, Streams, and Buffers.
 */
export const responseJsonSerializer = responseInterceptor(({ result }) => {
  if (!isHttpResult(result)) {
    return result;
  }

  const body = result.body;

  if (!isObjectBody(body)) {
    return result;
  }

  if (!result.contentType) {
    result.type('application/json');
  }

  return result.morph(JSON.stringify(body));
});