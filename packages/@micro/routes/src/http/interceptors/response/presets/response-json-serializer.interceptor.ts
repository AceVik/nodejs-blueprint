import { responseInterceptor } from '../response-interceptor.factory.js';
import { isHttpResult, isObjectBody } from '../../../result/index.js';
import { resultNormalizer } from './result-normalizer.interceptor.js';

/**
 * The default serializer.
 * Converts Objects/Arrays (ObjectBody) to JSON strings.
 * Ignores Strings, Streams, and Buffers.
 */
export const responseJsonSerializer = responseInterceptor(({ result }) => {
  if (!isHttpResult(result)) {
    return result;
  }

  const body = result.unwrap();

  if (!isObjectBody(body)) {
    return result;
  }

  if (!result.contentType?.length) {
    result.type('application/json');
  }

  return result.morph(JSON.stringify(body));
}).after(resultNormalizer);