import { join } from 'node:path';
import { readdir } from 'node:fs/promises';
import { Route } from '@micro/routes/route';
import { requestMethods, type RequestMethod } from '@micro/routes/http';


function setMethodFromExportName(exportName: string): RequestMethod {
  const upper = exportName.toUpperCase();
  for (const method of requestMethods) {
    if (upper.startsWith(method)) return method;
  }

  return 'GET';
}

async function loadRoutesFromFile(routesFilepath: string, routePath: string): Promise<Route[]> {
  const moduleExports = await import(`file://${routesFilepath}`);

  const routes: Route[] = [];
  for (const exportName in moduleExports) {
    const exported = moduleExports[exportName];
    if (exported instanceof Route) {
      Object.defineProperty(exported, 'name', {
        value: exportName,
      });

      if (!exported.method?.length) {
        Object.defineProperty(exported, 'method', {
          value: setMethodFromExportName(exportName),
        });
      }

      if (!exported.path?.length) {
        Object.defineProperty(exported, 'path', {
          value: routePath,
        });
      }

      routes.push(exported);
    }
  }

  return routes;
}

export async function importRoutes(routesPath: string, basePath: string = '/'): Promise<Route[]> {
  let lookingForRoutes = true;
  return (await Promise.all((await readdir(routesPath, { withFileTypes: true })).map((entry) => {
    return new Promise<Route[]>(async (resolve) => {
      if (lookingForRoutes && entry.isFile() && entry.name.startsWith('routes') && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
        lookingForRoutes = false;
        resolve(await loadRoutesFromFile(join(routesPath, entry.name), basePath));
      } else if(entry.isDirectory()) {
        let segment = entry.name;
        if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
          segment = `:${entry.name.slice(1, -1)}`.replace(/^::/is, ':');
        }

        resolve(await importRoutes(join(routesPath, entry.name), join(basePath, segment)));
      } else {
        resolve([]);
      }
    });
  }))).flat();
}
