import type { Route } from '../route/index.js';
import type { Request, Response, RequestInterceptor, ResponseInterceptor } from '../http/index.js';

/**
 * Executes the chain of Request Interceptors (Before) and the Route Handler.
 * Uses a recursive dispatch mechanism (Onion Model).
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param route - The route definition.
 * @param interceptors - The stack of request interceptors.
 * @param handler - The actual route handler function.
 * @returns The result returned by the route handler.
 */
async function runRequestPhase(
  req: Request,
  res: Response,
  route: Route<never>,
  interceptors: RequestInterceptor[],
  handler: () => Promise<unknown>,
): Promise<unknown> {
  let handlerResult: unknown;
  let handlerExecuted = false;

  const dispatch = async (index: number): Promise<void> => {
    if (index >= interceptors.length) {
      handlerResult = await handler();
      handlerExecuted = true;
      return;
    }

    const interceptor = interceptors[index]!;

    await interceptor.intercept({
      req,
      res,
      route,
      next: () => dispatch(index + 1),
    });
  };

  await dispatch(0);

  if (!handlerExecuted) {
    throw new Error('Route handler was not executed. Did a RequestInterceptor forget to call next()?');
  }

  return handlerResult;
}

/**
 * Executes the chain of Response Interceptors (After).
 * Uses a pipeline model where the result of one interceptor is passed to the next.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param route - The route definition.
 * @param interceptors - The stack of response interceptors.
 * @param initialResult - The result returned by the request phase.
 * @returns The final transformed result.
 */
async function runResponsePhase(
  req: Request,
  res: Response,
  route: Route<never>,
  interceptors: ResponseInterceptor[],
  initialResult: unknown,
): Promise<unknown> {
  let result = initialResult;

  for (const interceptor of interceptors) {
    result = await interceptor.intercept({
      req,
      res,
      route,
      result,
    });
  }

  return result;
}

/**
 * Orchestrates the full lifecycle of a request: Request Interceptors -> Handler -> Response Interceptors.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param route - The route definition.
 * @param coreHandler - The wrapped route handler.
 * @returns The final result to be sent to the client.
 */
export async function executeRoute(
  req: Request,
  res: Response,
  route: Route<never>,
  coreHandler: () => Promise<unknown>,
): Promise<unknown> {
  // Use the precalculated interceptor chains which now include all resolved dependencies
  const rawResult = await runRequestPhase(
    req,
    res,
    route,
    route.beforeInterceptors,
    coreHandler,
  );

  return runResponsePhase(
    req,
    res,
    route,
    route.afterInterceptors,
    rawResult,
  );
}