import { join, resolve } from 'node:path';
import { readdir } from 'node:fs/promises';
import { Route } from '../route/index.js';
import { requestMethods, type RequestMethod } from '../http/index.js';

/**
 * Infers the HTTP method from the export name.
 *
 * @param exportName - The name of the exported member.
 * @returns The inferred HTTP method, defaults to 'GET'.
 */
function setMethodFromExportName(exportName: string): RequestMethod {
  const upper = exportName.toUpperCase();
  for (const method of requestMethods) {
    if (upper.startsWith(method)) return method;
  }
  return 'GET';
}

/**
 * Loads routes from a specific file.
 *
 * @param routesFilepath - The absolute path to the routes file.
 * @param routePath - The base route path for the loaded routes.
 * @returns A promise that resolves to an array of loaded routes.
 */
async function loadRoutesFromFile(routesFilepath: string, routePath: string): Promise<Route<never, never>[]> {
  // Ensure an absolute file URL is used for dynamic import.
  const fileUrl = `file://${routesFilepath}`;
  const moduleExports = await import(fileUrl);

  const routes: Route<never, never>[] = [];
  for (const exportName in moduleExports) {
    const exported = moduleExports[exportName];
    if (exported instanceof Route) {
      // Set the route name if not already defined
      Object.defineProperty(exported, 'name', {
        value: exportName,
      });

      // Set HTTP method if not defined
      if (!exported.method?.length) {
        Object.defineProperty(exported, 'method', {
          value: setMethodFromExportName(exportName),
        });
      }

      // Set the path if not defined
      if (!exported.path?.length) {
        Object.defineProperty(exported, 'path', {
          value: routePath,
        });
      }
      routes.push(exported as unknown as Route<never, never>);
    }
  }
  return routes;
}

/**
 * Imports all routes from the specified directory recursively.
 * Converts the routesPath to an absolute path to ensure dynamic imports work correctly via file URLs.
 *
 * @param routesPath - The path to the directory containing route files.
 * @param basePath - The base URL path for the routes (default: '/').
 * @returns A promise that resolves to an array of all imported routes.
 */
export async function importRoutes(routesPath: string, basePath: string = '/'): Promise<Route<never, never>[]> {
  // Make routesPath absolute if it isn't already.
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
      // Handle dynamic route segments like [id] -> :id
      if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
        segment = `:${entry.name.slice(1, -1)}`.replace(/^::/i, ':');
      }
      const subdir = join(absoluteRoutesPath, entry.name);
      // Recursive call with updated base path
      return await importRoutes(subdir, join(basePath, segment));
    }
    return [];
  }));

  return routesArrays.flat();
}
