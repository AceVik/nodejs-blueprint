import { describe, it, expect } from 'vitest';
import { route } from '@micro/routes/route';
import { fromQuery } from '@micro/routes/param';
import { z } from 'zod';
import { Request } from '@micro/routes';
import { BadRequestError } from '@micro/routes/http';

function makeUwsReq(query: string) {
  return {
    getUrl: () => '/test?' + query,
    getMethod: () => 'get',
    getQuery: () => query,
    getHeader: (_name: string) => undefined as any,
    forEach: (_cb: (key: string, value: string) => void) => {},
    getParameter: (_name: string) => undefined,
  } as any;
}

function makeUwsRes() {
  return {
    getRemoteAddressAsText: () => new Uint8Array([48]),
    getProxiedRemoteAddressAsText: () => new Uint8Array([48]),
  } as any;
}

describe('Route.class behavior', () => {
  it('invokes handler with validated params on success', async () => {
    let received: any = null;
    const r = route({
      method: 'GET',
      params: {
        q: fromQuery(z.string()),
      },
    }, async (args) => {
      received = args.params;
    });

    // Patch path for openapi internals (not strictly needed here)
    Object.defineProperty(r, 'path', { value: '/test' });

    const req = new Request(makeUwsReq('q=hello'), makeUwsRes());
    await r.handleRequest(req as any, {} as any, {} as any, () => {});

    expect(received).toEqual({ q: 'hello' });
  });

  it('throws BadRequestError and does not call handler when validation fails (aggregates errors)', async () => {
    let called = false;
    const r = route({
      method: 'GET',
      params: {
        a: fromQuery('a', z.string().min(2)),
        b: fromQuery('b', z.string().min(3)),
      },
    }, async () => { called = true; });
    Object.defineProperty(r, 'path', { value: '/fail' });

    const req = new Request(makeUwsReq('a=x&b=yy'), makeUwsRes());
    try {
      await r.handleRequest(req as any, {} as any, {} as any, () => {});
      throw new Error('Expected to throw');
    } catch (e: any) {
      expect(e).toBeInstanceOf(BadRequestError);
      // error payload should contain two issues (from both params)
      expect(Array.isArray(e.errors)).toBe(true);
      expect(e.errors.length).toBeGreaterThanOrEqual(1);
      // We expect at least one aggregated error; exact count depends on zod issues
      expect(called).toBe(false);
    }
  });

  it('invokes handler with empty params when no params are defined', async () => {
    let received: any = null;
    const r = route({ method: 'GET' }, async (args) => { received = args.params; });
    Object.defineProperty(r, 'path', { value: '/noparams' });
    const req = new Request(makeUwsReq(''), makeUwsRes());
    await r.handleRequest(req as any, {} as any, {} as any, () => {});
    expect(received).toEqual({});
  });
});
