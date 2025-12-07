import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { importRoutes } from '@micro/routes/router';

describe('importRoutes with prefix', () => {
  it('applies prefix to all imported routes without duplicating slashes and keeps order stable', async () => {
    const testRoutesDir = join(__dirname, 'routes');
    const prefix = '/api/v1';
    const routes = await importRoutes(testRoutesDir, prefix);

    // Paths are prefixed
    for (const r of routes as any[]) {
      expect(r.path.startsWith(prefix + (prefix.endsWith('/') ? '' : '')) || r.path.startsWith(prefix)).toBe(true);
      // No accidental double slashes (except the leading one)
      expect(r.path.replace(prefix, '').includes('//')).toBe(false);
    }

    // Deterministic order: calling again yields same order and paths
    const routes2 = await importRoutes(testRoutesDir, prefix);
    expect(routes2.map((r: any) => r.path)).toEqual(routes.map((r: any) => r.path));
  });
});
