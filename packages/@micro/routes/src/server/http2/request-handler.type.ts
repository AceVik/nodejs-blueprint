import type { Http2ServerRequest, Http2ServerResponse } from 'http2';

export type RequestHandler = (req: Http2ServerRequest, res: Http2ServerResponse) => void;