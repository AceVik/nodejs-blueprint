import { join } from 'node:path';
import { importRoutes } from '@micro/routes/router/import-routes';

describe('importRoutes', () => {
  it('should import all routes from the test routes directory and match the snapshot', async () => {
    // Set test routes directory (siehe Dateistruktur)
    const routesDir = join(__dirname, 'routes');
    const routes = await importRoutes(routesDir, '/');
    // Verwende Snapshot-Tests, um die Struktur der geladenen Routen zu validieren
    expect(routes).toMatchSnapshot();
  });
});