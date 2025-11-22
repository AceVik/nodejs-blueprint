import { describe, it, expect } from 'vitest';
import { route } from '@micro/routes/route';
import { z } from 'zod';
import { fromPath, fromQuery } from '@micro/routes/param';

describe('Route', () => {
  it('should create a simple route with a handler', () => {
    const handler = () => { };
    const r = route(handler);
    expect(r).toBeDefined();
    expect(r.exec).toBe(handler);
    expect(r.method).toBe('');
    expect(r.path).toBe('');
  });

  it('should create a route with options', () => {
    const handler = () => { };
    const r = route({
      method: 'GET',
      for: 'localhost',
    }, handler);

    expect(r.method).toBe('GET');
    expect(r.hostnames).toBe('localhost');
  });

  it('should create a route with parameters', () => {
    const handler = () => { };
    const r = route({
      method: 'POST',
      params: {
        userId: fromPath(z.string()),
        search: fromQuery(z.string().optional()),
      },
    }, handler);

    expect(r.params).toBeDefined();
    expect(r.params!.userId).toBeDefined();
    expect(r.params!.search).toBeDefined();
    expect(r.params!.userId!.names).toEqual(['userId', 'user-id']); // name, kebab-name
  });
});
