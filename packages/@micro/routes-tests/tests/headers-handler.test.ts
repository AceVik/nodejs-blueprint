import { describe, it, expect } from 'vitest';
import { HeadersHandler } from '@micro/routes';

function makeReq(headers: Record<string, string | string[]>) {
  const normalized: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k] = Array.isArray(v) ? v : [v];
  }

  return {
    getHeader(name: string) {
      const vals = normalized[name];
      return vals ? vals[0] : undefined;
    },
    forEach(cb: (key: string, value: string) => void) {
      for (const [k, vals] of Object.entries(normalized)) {
        for (const v of vals) cb(k, v);
      }
    },
  } as any;
}

describe('HeadersHandler', () => {
  it('reads single header via get/has', () => {
    const req = makeReq({ 'x-one': '1' });
    const h = new HeadersHandler(req);
    expect(h.get('x-one')).toBe('1');
    expect(h.has('x-one')).toBe(true);
    expect(h.get('missing')).toBeNull();
    expect(h.has('missing')).toBe(false);
  });

  it('aggregates multiple header values and supports iteration', () => {
    const req = makeReq({ 'x-multi': ['a', 'b'], 'y': 'z' });
    const h = new HeadersHandler(req);

    expect(h.get('x-multi')).toBe('a');
    expect(h.getAll('x-multi')).toEqual(['a', 'b']);
    expect(h.getAll('missing')).toEqual([]);

    const seen: [string, string][] = [];
    for (const pair of h) seen.push(pair);
    expect(seen).toContainEqual(['x-multi', 'a']);
    expect(seen).toContainEqual(['x-multi', 'b']);
    expect(seen).toContainEqual(['y', 'z']);

    // Idempotence: iterating again yields same items, not doubled
    const seen2: [string, string][] = [];
    for (const pair of h) seen2.push(pair);
    expect(seen2).toEqual(seen);
  });
});
