import { describe, it, expect } from 'vitest';
import { createRoutesApp, route } from '@micro/routes';
import { fromPath, fromQuery, fromHeader, fromCookie } from '@micro/routes';
import { z } from 'zod';
import type { Route } from '@micro/routes/route';

function withPath(path: string, r: Route<any>) {
  Object.defineProperty(r, 'path', { value: path });
  return r;
}

describe('OpenAPI request params matrix', () => {
  it('auto-adds undeclared path params and respects required/optional and allowEmptyValue', async () => {
    const app = createRoutesApp();
    const r = route({ method: 'GET', params: {
      // required query
      q: fromQuery(z.string().min(1)),
      // optional query allows empty value
      filter: fromQuery(z.string().optional().describe('Empty allowed')),
      // header optional
      'x-flag': fromHeader(z.string().optional()),
      // cookie required
      sid: fromCookie(z.string()),
    } }, () => {});

    app.use(withPath('/users/:id/items/:itemId', r));
    const schema = await app.getOpenApiSchema({ title: 'X', version: '1.0.0' });
    const op = schema.paths!['/users/{id}/items/{itemId}'].get!;

    // Parameters present
    expect(Array.isArray(op.parameters)).toBe(true);
    const params = op.parameters as any[];

    const byIn = (loc: string) => params.filter(p => (p as any).in === loc);
    const qp = byIn('query');
    const hp = byIn('header');
    const cp = byIn('cookie');
    const pp = byIn('path');

    // auto path params
    const pId = pp.find(p => (p as any).name === 'id') as any;
    const pItem = pp.find(p => (p as any).name === 'itemId') as any;
    expect(pId?.required).toBe(true);
    expect(pItem?.required).toBe(true);

    // required vs optional flags
    const qParam = qp.find(p => (p as any).name === 'q') as any;
    const filterParam = qp.find(p => (p as any).name === 'filter') as any;
    expect(qParam?.required).toBe(true);
    expect(filterParam?.required).toBe(false);

    // allowEmptyValue reflects schema allowing empty string
    expect(filterParam?.allowEmptyValue).toBe(true);

    const headerParam = hp.find(p => (p as any).name === 'x-flag') as any;
    expect(headerParam?.required).toBe(false);

    const cookieParam = cp.find(p => (p as any).name === 'sid') as any;
    expect(cookieParam?.required).toBe(true);
  });
});
