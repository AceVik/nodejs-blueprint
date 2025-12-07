import { describe, it, expect } from 'vitest';
import { PathParamsHandler } from '@micro/routes';

function makeReq(params: Record<string, string>) {
  return {
    getParameter(name: string) {
      return params[name];
    },
  } as any;
}

describe('PathParamsHandler', () => {
  it('reads path parameters via get()', () => {
    const req = makeReq({ id: '42', section: 'users' });
    const p = new PathParamsHandler(req);
    expect(p.get('id')).toBe('42');
    expect(p.get('section')).toBe('users');
    expect(p.get('missing')).toBeNull();
  });
});
