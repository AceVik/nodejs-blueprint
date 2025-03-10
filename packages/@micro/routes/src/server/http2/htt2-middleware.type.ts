import type { Http2ServerRequest, Http2ServerResponse } from 'http2';

export type Http2Middleware = (req: Http2ServerRequest, res: Http2ServerResponse, next: () => void) => Promise<void> | void;