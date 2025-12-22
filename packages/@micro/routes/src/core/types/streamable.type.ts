import type { Readable } from 'node:stream';

export type Streamable =
  | Readable                     // Legacy Node streams
  | ReadableStream<Uint8Array>   // Modern Web Streams (Native in Node 18+)
  | AsyncIterable<Uint8Array>    // Modern iteration (Node 22+ optimized)
  | Buffer | Uint8Array | string;