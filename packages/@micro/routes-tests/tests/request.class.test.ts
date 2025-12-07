import { describe, it, expect } from 'vitest';
import { Request, HeadersHandler, CookieParamsHandler, PathParamsHandler } from '@micro/routes';

describe('Request.class', () => {
  function makeCountingReqRes() {
    const counts = { url: 0, method: 0, query: 0, getHeader: 0, forEach: 0, getParameter: 0 };
    const headers: Record<string, string[]> = { 'x-a': ['1'], cookie: ['sid=123'] };

    const req = {
      getUrl() { counts.url++; return '/p/42?x=1&x=2&y=z'; },
      getMethod() { counts.method++; return 'get'; },
      getQuery() { counts.query++; return 'x=1&x=2&y=z'; },
      getHeader(name: string) { counts.getHeader++; const vals = headers[name.toLowerCase()]; return vals ? vals[0] : undefined as any; },
      forEach(cb: (k: string, v: string) => void) { counts.forEach++; for (const [k, vals] of Object.entries(headers)) for (const v of vals) cb(k, v); },
      getParameter(name: string) { counts.getParameter++; return name === 'id' ? '42' : undefined; },
    } as any;

    const res = {
      getRemoteAddressAsText: () => new Uint8Array([49,46,48,46,48,46,49]), // 1.0.0.1
      getProxiedRemoteAddressAsText: () => new Uint8Array([49,48,46,48,46,48,46,49]), // 10.0.0.1
    } as any;

    return { req, res, counts };
  }

  it('caches url and method, exposes handlers and URLSearchParams', () => {
    const { req, res, counts } = makeCountingReqRes();
    const r = new Request(req, res);

    // url and method cache
    expect(r.url).toBe('/p/42?x=1&x=2&y=z');
    expect(r.url).toBe('/p/42?x=1&x=2&y=z');
    expect(counts.url).toBe(1);

    expect(r.method).toBe('GET');
    expect(r.method).toBe('GET');
    expect(counts.method).toBe(1);

    // query returns URLSearchParams and is cached
    const q1 = r.query;
    const q2 = r.query;
    expect(q1).toBe(q2);
    expect(q1.getAll('x')).toEqual(['1', '2']);
    expect(q1.get('y')).toBe('z');
    expect(counts.query).toBe(1);

    // remote addresses are decoded once each
    expect(r.remoteAddress).toBe('1.0.0.1');
    expect(r.remoteAddress).toBe('1.0.0.1');
    expect(r.remoteProxyAddress).toBe('10.0.0.1');
    expect(r.remoteProxyAddress).toBe('10.0.0.1');

    // handlers are instances and delegate to underlying req
    expect(r.headers).toBeInstanceOf(HeadersHandler);
    expect(r.cookies).toBeInstanceOf(CookieParamsHandler);
    expect(r.path).toBeInstanceOf(PathParamsHandler);

    expect(r.headers.get('x-a')).toBe('1');
    expect(r.cookies.get('sid')).toBe('123');
    expect(r.path.get('id')).toBe('42');
  });
});
