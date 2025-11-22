import { describe, it, expect } from 'vitest';
import { route } from '@micro/routes';
import { fromHeader, fromQuery, fromPath } from '@micro/routes/param';
import { z } from 'zod';

describe('Runtime Expansion Tests', () => {
  it('should handle header parameters', () => {
    const handler = () => { };
    const r = route({
      method: 'GET',
      params: {
        auth: fromHeader(z.string()),
        xApiKey: fromHeader(z.string().optional()),
      },
    }, handler);

    expect(r.params).toBeDefined();
    expect(r.params!.auth).toBeDefined();
    expect(r.params!.xApiKey).toBeDefined();
    expect(r.params!.auth!.names).toEqual(['auth', 'auth']);
    expect(r.params!.xApiKey!.names).toContain('x-api-key');
    expect(r.params!.xApiKey!.names).toContain('xApiKey');
  });

  it('should handle query parameters with coercion', () => {
    const handler = () => { };
    const r = route({
      method: 'GET',
      params: {
        page: fromQuery(z.coerce.number().default(1)),
        sort: fromQuery(z.string().optional()),
      },
    }, handler);

    expect(r.params).toBeDefined();
    expect(r.params!.page).toBeDefined();
    // Verify schema type if possible, or just existence
    expect(r.params!.page!.schema).toBeDefined();
  });

  it('should handle path parameters', () => {
    const handler = () => { };
    const r = route({
      method: 'GET',
      params: {
        userId: fromPath(z.string()),
        postId: fromPath(z.coerce.number()),
      },
    }, handler);

    expect(r.params).toBeDefined();
    expect(r.params!.userId!.names).toEqual(['userId', 'user-id']);
    expect(r.params!.postId!.names).toEqual(['postId', 'post-id']);
  });
});
