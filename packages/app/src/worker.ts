import { parentPort, workerData } from 'worker_threads';
import fs from 'node:fs';

interface RequestData {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface WorkerData {
  requestData: RequestData;
}

/**
 * Creates a fake response object for the worker.
 * The fake response sends data to the parent via postMessage.
 */
function createFakeResponse() {
  return {
    write: (chunk: any) => {
      parentPort?.postMessage({ type: 'data', data: chunk });
    },
    end: (chunk?: any) => {
      if (chunk) {
        parentPort?.postMessage({ type: 'data', data: chunk });
      }
      parentPort?.postMessage({ type: 'end' });
    },
    setHeader: (name: string, value: string) => {
      // Implement if needed.
    },
  };
}

/**
 * The worker handler function.
 * This function processes the request and writes the response using the fake response.
 */
async function handler(req: { method?: string; url?: string; headers: any }, res: ReturnType<typeof createFakeResponse>) {
  // Example: if URL is "/file", stream a file.
  if (req.url === '/file' && req.method?.toUpperCase() === 'GET') {
    const stream = fs.createReadStream('largefile.txt');
    stream.on('data', (chunk) => {
      res.write(chunk);
    });
    stream.on('end', () => {
      res.end();
    });
    stream.on('error', (err) => {
      res.end(`Error streaming file: ${err.message}`);
    });
  } else {
    res.end(`Hello from worker! You requested: ${req.url}`);
  }
}

async function run() {
  try {
    const { requestData } = workerData as WorkerData;
    const req = {
      method: requestData.method,
      url: requestData.url,
      headers: requestData.headers,
    };
    const res = createFakeResponse();
    await handler(req, res);
  } catch (error) {
    parentPort?.postMessage({ type: 'error', error: (error as Error).message });
  }
}

run();
