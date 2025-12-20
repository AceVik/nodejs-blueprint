import { join } from 'node:path';
import { tryImport } from '../../core/utils/try-import.util.js';
import { ErrorMiddleware } from './error-middleware.class.js';

/**
 * @deprecated
 */
export const importErrorMiddlewares = async (middlewaresPath: string): Promise<Record<string, ErrorMiddleware>> => {
  const [tsImports] = await Promise.all([
    tryImport(join(middlewaresPath, 'error.middlewares.ts')),
    tryImport(join(middlewaresPath, 'error.middlewares.js')),
  ]);

  const imports = tsImports;

  if (!imports) {
    return {};
  }

  const errorMiddlewares: Record<string, ErrorMiddleware> = {};
  for (const mwName in imports) {
    const mw = imports[mwName];

    if (mw instanceof ErrorMiddleware) {
      errorMiddlewares[mwName] = mw;
    }
  }

  return errorMiddlewares;
};