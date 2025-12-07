import { describe, it, expect } from 'vitest';
import { createRoutesApp, route } from '@micro/routes';
import { fromPath, fromQuery, fromHeader } from '@micro/routes';
import { z } from 'zod';
import type { Route } from '@micro/routes';

function createRoute(path: string, r: Route<any>) {
  Object.defineProperty(r, 'path', { value: path });
  return r;
}


describe('OpenAPI Generation', () => {
  it('should generate a valid OpenAPI schema', () => {
    const app = createRoutesApp();

    app.use(createRoute('/users/:userId', route({
      method: 'GET',
      params: {
        userId: fromPath(z.string()),
        search: fromQuery(z.string().optional()),
        apiKey: fromHeader(z.string()),
      },
    }, () => { })));

    const schema = app.getOpenApiSchema({
      title: 'Test API',
      version: '1.0.0',
    });

    expect(schema.openapi).toBe('3.1.0');
    expect(schema.info.title).toBe('Test API');
    expect(schema.paths!['/users/{userId}']).toBeDefined();

    const getOp = schema.paths!['/users/{userId}'].get;
    expect(getOp).toBeDefined();
    expect(getOp!.parameters).toHaveLength(3);

    const params = getOp!.parameters as any[];
    const pathParam = params.find((p) => p.in === 'path');
    const queryParam = params.find((p) => p.in === 'query');
    const headerParam = params.find((p) => p.in === 'header');

    expect(pathParam.name).toBe('userId');
    expect(pathParam.required).toBe(true);

    expect(queryParam.name).toBe('search');
    expect(queryParam.required).toBe(false);

    expect(headerParam.name).toBe('api-key');
    expect(headerParam.required).toBe(true);
  });
});
