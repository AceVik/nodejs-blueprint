import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRoutesApp } from '@micro/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

(async () => {
  const app = createRoutesApp({
    // dh_params_file_name: resolve(__dirname, 'certs', 'dhparam.pem'),
    // key_file_name: resolve(__dirname, 'certs', 'server.key'),
    // cert_file_name: resolve(__dirname, 'certs', 'server.crt'),
  });

  await app.listen(host, port, (socket) => {
    if (socket) {
      if (socket.threadId) {
        console.log(`Server listening on ${host}:${port} with threadId: ${socket.threadId}`);
      } else {
        console.log(`Server listening on ${host}:${port} at main thread.`);
      }
    } else {
      console.error('Failed to listen', socket);
    }
  });
})();