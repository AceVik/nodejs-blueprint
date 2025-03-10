import { createSecureServer, SecureServerOptions, type Http2SecureServer } from 'node:http2';
import { mainHandler } from '@micro/routes/server/main.handler';

export const createHttp2Server = (options?: SecureServerOptions): Http2SecureServer => {
  let server: Http2SecureServer;
  if (options) {
    server = createSecureServer(options, mainHandler);
  } else {
    server = createSecureServer(mainHandler);
  }

  return server;
};