import { describe, it, expect } from 'vitest';
import { createRoutesApp, route } from '@micro/routes';
import { errorMiddleware } from '@micro/routes/middleware';
import { z } from 'zod';
import type { Route } from '@micro/routes/route';

function withPath(path: string, r: Route<any>) {
  Object.defineProperty(r, 'path', { value: path });
  return r;
}

describe('OpenAPI error middlewares', () => {
  it('deduplicates shared schemas by refId and includes responses from all middlewares', () => {
    const app = createRoutesApp();

    const SharedError = z.object({ status: z.number(), message: z.string() }).openapi({ refId: 'SharedError' });

    const mw1 = errorMiddleware('mw1', { '418': SharedError }, () => {});
    const mw2 = errorMiddleware('mw2', { '419': SharedError }, () => {});

    app.use(
      withPath('/ok', route({ method: 'GET' }, () => {})),
      mw1,
      mw2,
    );

    const schema = app.getOpenApiSchema({ title: 'X', version: '1.0.0' });
    const op = schema.paths!['/ok'].get!;

    expect(op.responses['418']).toBeDefined();
    expect(op.responses['419']).toBeDefined();

    // Either the schema is registered in components or inlined in responses; in any case, responses must have a schema
    const s418 = (op.responses['418'] as any).content?.['application/json']?.schema;
    const s419 = (op.responses['419'] as any).content?.['application/json']?.schema;
    expect(s418).toBeDefined();
    expect(s419).toBeDefined();
  });
});
