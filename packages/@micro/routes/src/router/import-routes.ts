import { join, resolve } from 'node:path';
import { readdir } from 'node:fs/promises';
import { Route } from '../route/index.js';
import { requestMethods, type RequestMethod } from '../http/index.js';

function setMethodFromExportName(exportName: string): RequestMethod {
  const upper = exportName.toUpperCase();
  for (const method of requestMethods) {
    if (upper.startsWith(method)) return method;
  }
  return 'GET';
}

/**
 * Lädt Routen aus einer Datei. Der übergebene routesFilepath muss absolut sein.
 */
async function loadRoutesFromFile(routesFilepath: string, routePath: string): Promise<Route<never>[]> {
  // Stelle sicher, dass ein absoluter File-URL verwendet wird.
  const fileUrl = `file://${routesFilepath}`;
  const moduleExports = await import(fileUrl);

  const routes: Route<never>[] = [];
  for (const exportName in moduleExports) {
    const exported = moduleExports[exportName];
    if (exported instanceof Route) {
      Object.defineProperty(exported, 'name' as keyof Route<never>, {
        value: exportName,
      });
      // Setze HTTP-Methode, falls noch nicht definiert
      if (!exported.method?.length) {
        Object.defineProperty(exported, 'method' as keyof Route<never>, {
          value: setMethodFromExportName(exportName),
        });
      }
      // Setze den Pfad, falls noch nicht definiert
      if (!exported.path?.length) {
        Object.defineProperty(exported, 'path' as keyof Route<never>, {
          value: routePath,
        });
      }
      routes.push(exported as unknown as Route<never>);
    }
  }
  return routes;
}

/**
 * Importiert alle Routen aus dem angegebenen Verzeichnis.
 * Dabei wird routesPath in einen absoluten Pfad umgewandelt, sodass spätere dynamische Importe
 * über einen absoluten File-URL erfolgen.
 */
export async function importRoutes(routesPath: string, basePath: string = '/'): Promise<Route<never>[]> {
  // Mache routesPath absolut, falls es das nicht schon ist.
  const absoluteRoutesPath = resolve(routesPath);
  let lookingForRoutes = true;

  const dirEntries = await readdir(absoluteRoutesPath, { withFileTypes: true });
  const routesArrays = await Promise.all(dirEntries.map(async (entry) => {
    if (lookingForRoutes && entry.isFile() && entry.name.startsWith('routes') && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
      lookingForRoutes = false;
      const filePath = join(absoluteRoutesPath, entry.name);
      return await loadRoutesFromFile(filePath, basePath);
    } else if (entry.isDirectory()) {
      let segment = entry.name;
      if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
        segment = `:${entry.name.slice(1, -1)}`.replace(/^::/i, ':');
      }
      const subdir = join(absoluteRoutesPath, entry.name);
      // Rekursiver Aufruf mit aktualisiertem Basis-Pfad
      return await importRoutes(subdir, join(basePath, segment));
    }
    return [];
  }));
  return routesArrays.flat();
}
