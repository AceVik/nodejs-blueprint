import type { Http2Middleware } from './htt2-middleware.type';
import type { RequestHandler } from './request-handler.type';

const http2middlewares = new Set<Http2Middleware>();

export const addHttp2Middleware = (middleware: Http2Middleware) => {
  http2middlewares.add(middleware);
};

export const runHttp2Middlewares: RequestHandler = async (req, res) => {
  let processNext: boolean;
  const next = () => {
    processNext = true;
  };

  for (const middleware of http2middlewares) {
    processNext = false;
    await middleware(req, res, next);

    if (!processNext) {
      break;
    }
  }
};