import { describe, it, expect } from 'vitest';
import { Request } from '@micro/routes';

function makeReq({
  url = '/p?'+'' ,
  method = 'get',
  query = '',
  headers = {} as Record<string, string[]>,
}: Partial<{url:string;method:string;query:string;headers:Record<string,string[]>}> = {}) {
  const normalized: Record<string, string[]> = {};
  for (const [k,v] of Object.entries(headers)) normalized[k] = Array.isArray(v) ? v : [v as any];
  return {
    getUrl: () => url,
    getMethod: () => method,
    getQuery: () => query,
    getHeader: (name: string) => {
      const vals = normalized[name];
      return vals ? vals[0] : undefined as any;
    },
    forEach: (cb: (k: string, v: string) => void) => {
      for (const [k, vals] of Object.entries(normalized)) for (const v of vals) cb(k, v);
    },
    getParameter: (_: string) => undefined,
  } as any;
}

function makeRes() {
  return {
    getRemoteAddressAsText: () => new Uint8Array([49,46,50,46,51,46,52]),
    getProxiedRemoteAddressAsText: () => new Uint8Array([57,46,57,46,57,46,57]),
  } as any;
}

describe('Request edge cases', () => {
  it('empty query yields empty URLSearchParams and preserves repeated ordering', () => {
    const r = new Request(makeReq({ query: '' }), makeRes());
    expect(r.query.get('x')).toBeNull();
    const r2 = new Request(makeReq({ query: 'x=1&x=2&x=3' }), makeRes());
    expect(r2.query.getAll('x')).toEqual(['1','2','3']);
  });

  it('lone key without value is present with empty string', () => {
    const r = new Request(makeReq({ query: 'a' }), makeRes());
    expect(r.query.get('a')).toBe('');
  });

  it('reserved characters are decoded according to URL semantics', () => {
    const r = new Request(makeReq({ query: 'enc=%5B1%2C2%5D&space=a+b' }), makeRes());
    expect(r.query.get('enc')).toBe('[1,2]');
    // URLSearchParams decodes + as space
    expect(r.query.get('space')).toBe('a b');
  });

  it('raw returns original HttpRequest object', () => {
    const raw = makeReq({ query: 'a=1' });
    const r = new Request(raw, makeRes());
    expect(r.raw).toBe(raw);
  });
});
