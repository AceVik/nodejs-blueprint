import { join } from 'node:path';
import { importRoutes } from '@micro/routes/router';

describe('importRoutes', () => {
  it('should import all routes from the built package and match the snapshot', async () => {
    const testRoutesDir = join(__dirname, 'routes');
    const routes = await importRoutes(testRoutesDir, '/');
    expect(routes).toMatchSnapshot();
  });
});
