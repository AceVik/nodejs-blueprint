import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, workerData } from 'node:worker_threads';
import { SSLApp, App, type RecognizedString } from 'uWebSockets.js';
import { findRoutesFolder, importRoutes } from '@micro/routes/router';
import type { CreateRoutesAppOptions } from './create-routes-app-params.type';
import type { WorkerOptions } from './worker-options.type';
import type { ListenCallback, UWSListenCallback } from './listen-callback.type';

const __filename = fileURLToPath(import.meta.url);


async function getListenCallback(cb?: ListenCallback): Promise<UWSListenCallback> {
  if (isMainThread) {
    return (listenSocket)=> {
      cb?.({ listenSocket });
    };
  } else {
    const { parentPort, threadId } = await import('node:worker_threads');
    return (listenSocket) => {
      parentPort!.postMessage({ type: 'listening', threadId, listenSocket: JSON.stringify(listenSocket) });
    };
  }
}

type RunOptions<T> = T & {
  listenAtUnixSocket: boolean;
  callback?: ListenCallback;
} & Partial<({
  host: RecognizedString;
  port: number;
} & {
  unixPath: RecognizedString;
})>;

export async function runRoutes(options: RunOptions<CreateRoutesAppOptions>) {
  if (!isMainThread) {
    throw new Error('runRoutes() must be called from the main thread');
  }

  const { routes_path: _routesPath, workers, callback, ...workerOptions } = options;
  const routesPath = _routesPath || await findRoutesFolder() || undefined;
  const numWorkers = options.workers || os.cpus().length;

  const params = {
    ...workerOptions,
    routes_path: routesPath,
  } satisfies RunOptions<WorkerOptions>;

  if (numWorkers <= 1) {
    await initWorker(params, callback);
  } else {
    const workers = new Set<Worker>();
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(__filename, {
        workerData: params,
        env: process.env,
        argv: process.argv,
        execArgv: [...process.execArgv, '--no-warnings'],
      });

      worker.on('message', (msg) => {
        if (msg.type === 'listening') {
          callback?.({
            threadId: msg.threadId,
            listenSocket: msg.listenSocket,
          });
        }
      });

      workers.add(worker);
    }

    process.on('SIGINT', () => {
      process.on('SIGINT', () => {
        const pending = new Set(workers);

        for (const worker of workers) {
          worker.postMessage('SIGINT');
          worker.once('message', (msg) => {
            if (msg === 'SIGINT_ACK') {
              pending.delete(worker);
              if (pending.size === 0) {
                process.exit(0);
              }
            }
          });
        }

        setTimeout(() => {
          if (pending.size > 0) {
            process.exit(1);
          }
        }, 5000);
      });
    });
  }
}

async function initWorker(options: RunOptions<WorkerOptions>, callback?: ListenCallback) {
  const { routes_path, listenAtUnixSocket, host, port, unixPath, ...appOptions } = options;
  const useSSL = appOptions.key_file_name && appOptions.cert_file_name;

  const [routes, app] = await Promise.all([
    importRoutes(routes_path!),
    (async () => {
      return useSSL ? SSLApp(appOptions) : App(appOptions);
    })(),
  ]);

  if (isMainThread) {
    process.on('SIGINT', () => {
      app.close();
      process.exit(0);
    });
  } else {
    const { parentPort } = await import('node:worker_threads');
    parentPort?.on('message', (msg) => {
      if (msg === 'SIGINT') {
        app.close();
        parentPort?.postMessage('SIGINT_ACK');
        process.exit(0);
      }
    });
  }

  if (routes.length === 0) {
    throw new Error('No routes found');
  }

  for (const route of routes) {
    switch (route.method) {
    case 'GET':
      app.get(route.path, route.handleRequest.bind(route));
      break;
    case 'POST':
      app.post(route.path, route.handleRequest.bind(route));
      break;
    case 'PUT':
      app.put(route.path, route.handleRequest.bind(route));
      break;
    case 'DELETE':
      app.del(route.path, route.handleRequest.bind(route));
      break;
    case 'PATCH':
      app.patch(route.path, route.handleRequest.bind(route));
      break;
    case 'OPTIONS':
      app.options(route.path, route.handleRequest.bind(route));
      break;
    case 'HEAD':
      app.head(route.path, route.handleRequest.bind(route));
      break;
    case 'TRACE':
      app.trace(route.path, route.handleRequest.bind(route));
      break;
    case 'CONNECT':
      app.connect(route.path, route.handleRequest.bind(route));
      break;
    }
  }

  const cb = await getListenCallback(callback);

  if (listenAtUnixSocket) {
    app.listen_unix(cb, unixPath!);
  } else {
    app.listen(host!, port!, cb);
  }
}

if (!isMainThread) {
  initWorker(workerData);
}