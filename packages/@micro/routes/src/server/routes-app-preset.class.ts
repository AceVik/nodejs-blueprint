import type { RecognizedString } from 'uWebSockets.js';
import { toRecognizedString } from '@micro/routes/utils';
import type { CreateRoutesAppOptions } from './create-routes-app-params.type';
import type { ListenCallback } from './listen-callback.type';
import { runRoutes } from './runner';

const defaultHost = toRecognizedString('127.0.0.1');

export class RoutesAppPreset {
  constructor(private readonly options: CreateRoutesAppOptions) {}


  public async listen(port: number, cb?: ListenCallback): Promise<void>;
  public async listen(host: RecognizedString, port: number, cb?: ListenCallback): Promise<void>;
  public async listen(unixPath: RecognizedString, cb?: ListenCallback): Promise<void>;
  public async listen(
    hostOrPortOrUnixPath: number | RecognizedString,
    portOrCb?: number | ListenCallback,
    cb?: ListenCallback,
  ): Promise<void> {
    if (typeof hostOrPortOrUnixPath === 'number') {
      const port = hostOrPortOrUnixPath;
      const callback = typeof portOrCb === 'function' ? portOrCb : cb;
      await runRoutes({
        ...this.options,
        listenAtUnixSocket: false,
        host: defaultHost,
        port,
        callback,
      });
    } else {
      if (typeof portOrCb === 'number') {
        const host = hostOrPortOrUnixPath as RecognizedString;
        const port = portOrCb;
        await runRoutes({
          ...this.options,
          listenAtUnixSocket: false,
          host,
          port,
          callback: cb,
        });
      } else {
        const unixPath = hostOrPortOrUnixPath as RecognizedString;
        const callback = typeof portOrCb === 'function' ? portOrCb : cb;
        await runRoutes({
          ...this.options,
          listenAtUnixSocket: true,
          unixPath,
          callback,
        });
      }
    }
  }
}
