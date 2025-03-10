import fs from 'node:fs';
import { join, resolve } from 'node:path';
import { requestMethods } from '@micro/routes/http';
import { createHttp2Server } from '@micro/routes';
import { importRoutes } from '@micro/routes/router';

const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

function isAsyncFunction(fn: Function): boolean {
  return fn instanceof AsyncFunction;
}

const fromQuery = <TValue = string>(converter: (value: string) => Promise<TValue> | TValue) => {
  if (isAsyncFunction(converter)) {
    return { value: Promise.resolve('async result' as string) } as { value: Promise<TValue> };
  } else {
    return { value: 'sync result' } as { value: TValue };
  }
};

const asyncConverter = async () => { /* ... */ };
const syncConverter = () => { /* ... */ };

console.log(fromQuery(asyncConverter));
console.log(fromQuery(syncConverter));

console.log(requestMethods);

(async () => {

  const routes = await importRoutes(join(__dirname, 'routes'));
  console.log(routes);

  const http2Server = createHttp2Server({
    key: fs.readFileSync(resolve(__dirname, 'certs', 'server.key')),
    cert: fs.readFileSync(resolve(__dirname, 'certs', 'server.crt')),
    dhparam: fs.readFileSync(resolve(__dirname, 'certs', 'dhparam.pem')),
  });

  http2Server.listen(port, host, () => {
    console.log(`Secure HTTP/2 server listening on https://${host}:${port}`);
  });
})();