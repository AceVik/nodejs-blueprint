import http2 from 'node:http2';
import fs from 'node:fs';
import { resolve, join } from 'node:path';
import { Worker } from 'worker_threads';

const port = parseInt(process.env.PORT || '3000', 10);

const options = {
  key: fs.readFileSync(resolve(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(resolve(__dirname, 'certs', 'server.crt')),
  dhparam: fs.readFileSync(resolve(__dirname, 'certs', 'dhparam.pem')),
};

const server = http2.createSecureServer(options, (req, res) => {
  // Prepare minimal request data to pass to the worker.
  const requestData = {
    method: req.method,
    url: req.url,
    headers: req.headers,
  };

  // Spawn a new worker thread for each request.
  const worker = new Worker(resolve(__dirname, 'worker.ts'), {
    workerData: { requestData },
  });

  // Process messages from the worker.
  worker.on('message', (msg: any) => {
    if (msg.type === 'data') {
      res.write(msg.data);
    } else if (msg.type === 'end') {
      res.end();
    } else if (msg.type === 'error') {
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end(`Worker error: ${msg.error}`);
    }
  });

  worker.on('error', (err) => {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end(`Worker error: ${err.message}`);
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });
});

server.listen(port, () => {
  console.log(`Secure HTTP/2 server listening on port ${port}`);
});
