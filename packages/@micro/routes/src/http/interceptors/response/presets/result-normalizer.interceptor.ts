import { responseInterceptor } from '../response-interceptor.factory.js';
import { HttpResult, isHttpResult } from '../../../result/index.js';
import { isResult } from '../../../../core/result/index.js';

/**
 * Ensures that the result is always an HttpResult instance.
 *
 * Strategies:
 * 1. HttpResult: Passed through as-is.
 * 2. Service Result: Elevated to HttpResult using standard status mapping.
 * 3. Plain Value: Wrapped in HttpResult.ok().
 */
export const resultNormalizer = responseInterceptor(({ result }) => {
  if (isHttpResult(result)) {
    return result;
  }

  if (isResult(result)) {
    return HttpResult.fromResult(result);
  }

  return HttpResult.ok(result);
});