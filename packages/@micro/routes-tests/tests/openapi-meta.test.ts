import { describe, it, expect } from 'vitest';
import { createRoutesApp, route } from '@micro/routes';
import type { Route } from '@micro/routes/route';

function createRoute(path: string, r: Route<any>) {
  Object.defineProperty(r, 'path', { value: path });
  return r;
}

describe('OpenAPI meta wiring', () => {
  it('uses meta from route.openapi(...) for summary/description/tags/deprecated', async () => {
    const app = createRoutesApp();
    const r = route({ method: 'GET' }, () => {});
    r.openapi({
      summary: 'List items',
      description: 'Returns a list of items',
      tags: ['items', 'list'],
      deprecated: true,
    });

    app.use(createRoute('/items', r));

    const schema = await app.getOpenApiSchema({ title: 'X', version: '1.0.0' });
    const op = schema.paths!['/items'].get!;

    expect(op.summary).toBe('List items');
    expect(op.description).toBe('Returns a list of items');
    expect(op.tags).toEqual(['items', 'list']);
    expect(op.deprecated).toBe(true);
  });
});
