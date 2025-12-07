import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  fromPath,
  fromQuery,
  lastFromQuery,
  allFromQuery,
  fromHeader,
  lastFromHeader,
  allFromHeader,
  fromCookie,
  lastFromCookie,
  allFromCookie,
} from '@micro/routes';

describe('RouteParam Factories', () => {
  describe('Path Params', () => {
    it('should create a path param', () => {
      const p = fromPath(z.string());
      expect(p.type).toBe('path');
      expect(p.readType).toBe('first');
    });

    it('should create a path param with name', () => {
      const p = fromPath('id', z.string());
      expect(p.names).toEqual(['id']);
    });
  });

  describe('Query Params', () => {
    it('should create a query param (first)', () => {
      const p = fromQuery(z.string());
      expect(p.type).toBe('query');
      expect(p.readType).toBe('first');
    });

    it('should create a query param (last)', () => {
      const p = lastFromQuery(z.string());
      expect(p.type).toBe('query');
      expect(p.readType).toBe('last');
    });

    it('should create a query param (all)', () => {
      const p = allFromQuery(z.array(z.string()));
      expect(p.type).toBe('query');
      expect(p.readType).toBe('all');
    });
  });

  describe('Header Params', () => {
    it('should create a header param', () => {
      const p = fromHeader(z.string());
      expect(p.type).toBe('header');
    });

    it('should create a header param (last)', () => {
      const p = lastFromHeader(z.string());
      expect(p.type).toBe('header');
      expect(p.readType).toBe('last');
    });

    it('should create a header param (all)', () => {
      const p = allFromHeader(z.array(z.string()));
      expect(p.type).toBe('header');
      expect(p.readType).toBe('all');
    });
  });

  describe('Cookie Params', () => {
    it('should create a cookie param (first)', () => {
      const p = fromCookie(z.string());
      expect(p.type).toBe('cookie');
      expect(p.readType).toBe('first');
      expect(Array.isArray(p.names)).toBe(true);
    });

    it('should create a cookie param with name', () => {
      const p = fromCookie('session', z.string());
      expect(p.type).toBe('cookie');
      expect(p.names).toEqual(['session']);
    });

    it('should create a cookie param (last)', () => {
      const p = lastFromCookie(z.string());
      expect(p.type).toBe('cookie');
      expect(p.readType).toBe('last');
    });

    it('should create a cookie param (all)', () => {
      const p = allFromCookie(z.array(z.string()));
      expect(p.type).toBe('cookie');
      expect(p.readType).toBe('all');
    });
  });

  describe('Functional behavior with Request', () => {
    function makeUwsReq({
      url = '/users/42?q=hello&multi=one&multi=two',
      method = 'get',
      query = 'q=hello&multi=one&multi=two',
      cookies = 'sid=abc123; theme=dark',
      headers = { 'x-user': ['alice'], 'multi': ['a', 'b'] } as Record<string, string[]>,
      params = { id: '42' } as Record<string, string>,
    } = {}) {
      return {
        getUrl: () => url,
        getMethod: () => method,
        getQuery: () => query,
        getHeader: (name: string) => {
          if (name.toLowerCase() === 'cookie') return cookies as any;
          const vals = headers[name];
          return vals ? vals[0] : undefined as any;
        },
        forEach: (cb: (key: string, value: string) => void) => {
          for (const [k, vals] of Object.entries(headers)) for (const v of vals) cb(k, v);
        },
        getParameter: (name: string) => params[name],
      } as any;
    }

    function makeUwsRes() {
      return {
        getRemoteAddressAsText: () => new Uint8Array([49,46,50,46,51,46,52]),
        getProxiedRemoteAddressAsText: () => new Uint8Array([57,46,57,46,57,46,57]),
      } as any;
    }

    it('reads values through adapters: query/header/cookie/path', () => {
      const { Request } = require('@micro/routes');
      const req = new Request(makeUwsReq(), makeUwsRes());

      const pQ = fromQuery('q', z.string());
      const pHFirst = fromHeader('x-user', z.string());
      const pHAll = allFromHeader('multi', z.array(z.string()));
      const pC = fromCookie('sid', z.string());
      const pPath = fromPath('id', z.string());

      expect(pQ.getRawValue(req)).toBe('hello');
      expect(pQ.getValue(req)).toBe('hello');

      expect(pHFirst.getValue(req)).toBe('alice');
      expect(pHAll.getValue(req)).toEqual(['a', 'b']);

      expect(pC.getValue(req)).toBe('abc123');
      expect(pPath.getValue(req)).toBe('42');
    });

    it('validates and throws on invalid values', () => {
      const { Request } = require('@micro/routes');
      const uwsReq = makeUwsReq({ query: 'name=x' });
      const req = new Request(uwsReq, makeUwsRes());

      const nameParam = fromQuery('name', z.string().min(2));
      expect(() => nameParam.getValue(req)).toThrowError();
    });
  });
});
