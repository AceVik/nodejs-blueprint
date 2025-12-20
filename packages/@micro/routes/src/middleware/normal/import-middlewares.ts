import { join } from 'node:path';
import { tryImport } from '../../core/utils/try-import.util.js';
import type { ResolvedMiddlewaresConfig } from './middlewares.factory.js';
import { isResolvedMiddlewaresConfig } from './middlewares.factory.js';

export async function importMiddlewares(middlewaresPath: string): Promise<ResolvedMiddlewaresConfig | null> {
  const [tsImports, jsImports] = await Promise.all([
    tryImport(join(middlewaresPath, 'middlewares.ts')),
    tryImport(join(middlewaresPath, 'middlewares.js')),
  ]);

  const mod = tsImports ?? jsImports;
  if (!mod) return null;

  const def = (mod as any).default ?? mod;
  if (isResolvedMiddlewaresConfig(def)) return def;
  return null;
}
