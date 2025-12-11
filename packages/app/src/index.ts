import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRoutesApp } from '@micro/routes';
import { findRoutesFolder, importRoutes } from '@micro/routes/router';
import { findMiddlewaresFolder } from '@micro/routes/middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = parseInt(process.env.PORT || '3443', 10);

(async () => {
  const app = createRoutesApp({
    dh_params_file_name: resolve(__dirname, '..', 'certs', 'dhparam.pem'),
    key_file_name: resolve(__dirname, '..', 'certs', 'server.key'),
    cert_file_name: resolve(__dirname, '..', 'certs', 'server.crt'),
  });

  const middlewaresPath = await findMiddlewaresFolder();
  if (middlewaresPath) {

  }

  const routesPath = await findRoutesFolder();
  if (routesPath) {
    const routes = await importRoutes(routesPath);
    app.use(...routes);
  }

  app.listenExclusive(port, (s) => {
    if (s) {
      console.log(`Server listening on ${port}.`);
    } else {
      console.error('Failed to listen', s);
    }
  });
})();