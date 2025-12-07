import { describe, it, expect } from 'vitest';
import { Request } from '@micro/routes';
import { fromHeader, allFromHeader, lastFromHeader, fromQuery, allFromQuery, lastFromQuery, fromCookie, lastFromCookie, allFromCookie } from '@micro/routes';
import { z } from 'zod';

function makeUwsReq({
  query = '',
  headers = {} as Record<string, string[]>,
  cookies = '',
} = {}) {
  const normalized: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(headers)) normalized[k] = Array.isArray(v) ? v : [v as any];
  return {
    getUrl: () => '/t?' + query,
    getMethod: () => 'get',
    getQuery: () => query,
    getHeader: (name: string) => {
      if (name.toLowerCase() === 'cookie') return cookies as any;
      const vals = normalized[name];
      return vals ? vals[0] : undefined as any;
    },
    forEach: (cb: (k: string, v: string) => void) => {
      for (const [k, vals] of Object.entries(normalized)) for (const v of vals) cb(k, v);
    },
    getParameter: (_name: string) => undefined,
  } as any;
}

function makeUwsRes() {
  return {
    getRemoteAddressAsText: () => new Uint8Array([48]),
    getProxiedRemoteAddressAsText: () => new Uint8Array([48]),
  } as any;
}

describe('Adapters and Elevation', () => {
  it('headers adapter: first/last/all and aliases', () => {
    const req = new Request(makeUwsReq({ headers: { 'x-a': ['1', '2'], 'x-b': ['3'] } }), makeUwsRes());

    const hFirst = fromHeader(['x-missing', 'x-a'], z.string());
    const hLast = lastFromHeader('x-a', z.string());
    const hAll = allFromHeader(['x-missing', 'x-a'], z.array(z.string()));

    expect(hFirst.getRawValue(req)).toBe('1');
    expect(hFirst.getValue(req)).toBe('1');

    expect(hLast.getValue(req)).toBe('2');

    expect(hAll.getValue(req)).toEqual(['1', '2']);
  });

  it('query adapter: first/last/all with repeated/empty values and URL decoding', () => {
    const req = new Request(makeUwsReq({ query: 'q=a&q=b&empty=&enc=%7B%7D' }), makeUwsRes());
    const qFirst = fromQuery('q', z.string());
    const qLast = lastFromQuery('q', z.string());
    const qAll = allFromQuery('q', z.array(z.string()));
    const qEmpty = fromQuery('empty', z.string().optional());
    const qEnc = fromQuery('enc', z.string());

    expect(qFirst.getValue(req)).toBe('a');
    expect(qLast.getValue(req)).toBe('b');
    expect(qAll.getValue(req)).toEqual(['a', 'b']);
    expect(qEmpty.getValue(req)).toBe('');
    expect(qEnc.getValue(req)).toBe('{}');
  });

  it('cookie adapter: first/last/all with duplicates and aliases', () => {
    const cookies = 'sid=1; sid=2; alt=9';
    const req = new Request(makeUwsReq({ cookies }), makeUwsRes());
    const cFirst = fromCookie(['missing', 'sid'], z.string());
    const cLast = lastFromCookie('sid', z.string());
    const cAll = allFromCookie(['missing', 'sid'], z.array(z.string()));

    expect(cFirst.getValue(req)).toBe('1');
    // Cookie handler stores first occurrence per key, so `last` behaves like `first` for cookies
    expect(cLast.getValue(req)).toBe('1');
    // Cookie handler is single-valued per key; `all` wraps the first found value
    expect(cAll.getValue(req)).toEqual(['1']);
  });

  it('elevation: raw -> elevate -> parse (single and array)', () => {
    const req = new Request(makeUwsReq({ query: 'n=41&arr=1&arr=2' }), makeUwsRes());
    const n = fromQuery('n', z.number()).elevate((v) => v == null ? v as any : Number(v));
    const arr = allFromQuery('arr', z.array(z.number())).elevate((vs) => vs.map((x) => Number(x)));

    expect(n.getRawValue(req)).toBe('41');
    expect(n.getElevatedValue(req)).toBe(41);
    expect(n.getValue(req)).toBe(41);

    expect(arr.getRawValue(req)).toEqual(['1', '2']);
    expect(arr.getElevatedValue(req)).toEqual([1, 2]);
    expect(arr.getValue(req)).toEqual([1, 2]);
  });

  it('elevation: invalid after elevation should surface zod error via getValue()', () => {
    const req = new Request(makeUwsReq({ query: 'n=not-a-number' }), makeUwsRes());
    const n = fromQuery('n', z.number()).elevate((v) => Number(v));
    expect(() => n.getValue(req)).toThrow();
  });
});
