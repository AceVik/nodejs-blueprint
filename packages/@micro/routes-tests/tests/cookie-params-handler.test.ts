import { describe, it, expect } from 'vitest';
import { CookieParamsHandler } from '@micro/routes';

function makeReq(cookieHeader?: string) {
  return {
    getHeader(name: string) {
      if (name.toLowerCase() === 'cookie') return cookieHeader as any;
      return undefined as any;
    },
  } as any;
}

describe('CookieParamsHandler', () => {
  it('parses multiple cookies and supports get/has/getAll', () => {
    const req = makeReq('a=1; b=hello; c=%7B%22x%22%3A1%7D');
    const cookies = new CookieParamsHandler(req);

    expect(cookies.get('a')).toBe('1');
    expect(cookies.get('b')).toBe('hello');
    expect(cookies.get('c')).toBe('{"x":1}');
    expect(cookies.get('missing')).toBeNull();

    expect(cookies.has('a')).toBe(true);
    expect(cookies.has('missing')).toBe(false);

    const all = cookies.getAll();
    expect(all).toMatchObject({ a: '1', b: 'hello', c: '{"x":1}' });
  });

  it('returns null/false/{} when cookie header is missing', () => {
    const req = makeReq(undefined as any);
    const cookies = new CookieParamsHandler(req);
    expect(cookies.get('a')).toBeNull();
    expect(cookies.has('a')).toBe(false);
    expect(cookies.getAll()).toEqual({});
  });

  it('uses first value on duplicate cookie keys', () => {
    const req = makeReq('dup=first; dup=second');
    const cookies = new CookieParamsHandler(req);
    expect(cookies.get('dup')).toBe('first');
  });

  it('handles malformed pairs and extra whitespace/semicolons gracefully', () => {
    const req = makeReq(' ; = ; good=ok ; badpair ; spaced = value ; enc=%E0%A4%A');
    const cookies = new CookieParamsHandler(req);
    // valid pair parsed
    expect(cookies.get('good')).toBe('ok');
    // keys with spaces around are trimmed
    expect(cookies.get('spaced')).toBe('value');
    // undecodable percent remains as-is (no throw)
    expect(cookies.get('enc')).toBe('%E0%A4%A');
    // malformed entries (without '=') are ignored
    expect(cookies.get('badpair')).toBeNull();
  });

  it('handles quoted values and values containing = signs', () => {
    const req = makeReq('token=abc=def; quoted="hello world"; spaced = "a=b=c" ');
    const cookies = new CookieParamsHandler(req);
    expect(cookies.get('token')).toBe('abc=def');
    expect(cookies.get('quoted')).toBe('"hello world"');
    expect(cookies.get('spaced')).toBe('"a=b=c"');
  });
});
