import { findRoutesFolder } from '@micro/routes/router';

describe('findRoutesFolder', () => {
  it('should find the routes folder in cwd', async () => {
    const routesFolder = await findRoutesFolder();
    expect(routesFolder).not.toBeNull();
  });
});