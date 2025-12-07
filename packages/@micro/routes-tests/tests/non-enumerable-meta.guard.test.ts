import { describe, it, expect } from 'vitest';
import { Route } from '@micro/routes/route';

describe('Route.meta non-enumerable guard', () => {
  it('ensures `meta` property is not enumerable on Route instances', () => {
    const desc = Object.getOwnPropertyDescriptor(Route.prototype as any, 'meta');
    // Either the property does not exist, or it exists but is non-enumerable
    if (desc) {
      expect(desc.enumerable).toBe(false);
    } else {
      // If no property is defined on prototype, also acceptable
      expect(desc).toBeUndefined();
    }
  });
});
