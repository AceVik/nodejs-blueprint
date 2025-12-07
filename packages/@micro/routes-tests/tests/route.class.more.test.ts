import { describe, it, expect } from 'vitest';
import { route } from '@micro/routes/route';
import { fromQuery } from '@micro/routes/param';
import { z, ZodError } from 'zod';
import { Request } from '@micro/routes';
import { BadRequestError } from '@micro/routes/http';

function makeUwsReq(query: string) {
  return {
    getUrl: () => '/x?' + query,
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

describe('Route.class extra behaviors', () => {
  it('aggregated error object contains expected shape', async () => {
    const r = route({ method: 'GET', params: {
      a: fromQuery('a', z.string().min(3).describe('A')), // too short
      b: fromQuery('b', z.string().regex(/^[0-9]+$/).describe('B')), // invalid chars
    } }, async () => {});
    Object.defineProperty(r, 'path', { value: '/agg' });

    const req = new Request(makeUwsReq('a=x&b=yy'), makeUwsRes());
    try {
      await r.handleRequest(req as any, {} as any, {} as any, () => {});
      throw new Error('expected');
    } catch (e: any) {
      expect(e).toBeInstanceOf(BadRequestError);
      const errs = e.errors as any[];
      expect(Array.isArray(errs)).toBe(true);
      expect(errs.length).toBeGreaterThan(0);
      const first = errs[0];
      expect(first).toMatchObject({
        message: expect.any(String),
        name: expect.any(String),
        type: expect.any(String),
        readType: expect.any(String),
        values: expect.objectContaining({ raw: expect.anything() }),
      });
      expect(Array.isArray(first.issues)).toBe(true);
    }
  });

  it('non-Zod errors from param propagate directly', async () => {
    const p = fromQuery('boom', z.string());
    // Monkey-patch to throw non-Zod error
    const orig = (p as any).getValue;
    (p as any).getValue = () => { throw new Error('boom'); };

    const r = route({ method: 'GET', params: { boom: p as any } }, async () => {});
    Object.defineProperty(r, 'path', { value: '/boom' });
    const req = new Request(makeUwsReq('boom=x'), makeUwsRes());
    await expect(r.handleRequest(req as any, {} as any, {} as any, () => {})).rejects.not.toBeInstanceOf(BadRequestError);
    // restore just in case
    (p as any).getValue = orig;
  });

  it('forwards onAborted through handler args', async () => {
    let registered = false;
    const r = route({ method: 'GET' }, async ({ onAborted }) => {
      onAborted(() => { registered = true; });
    });
    Object.defineProperty(r, 'path', { value: '/onab' });
    const req = new Request(makeUwsReq(''), makeUwsRes());
    const noopRes = {} as any;
    const app = {} as any;
    const registrator = (fn: () => void) => { fn(); };
    await r.handleRequest(req as any, noopRes, app, registrator);
    expect(registered).toBe(true);
  });
});
