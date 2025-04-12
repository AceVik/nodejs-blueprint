import { join } from 'node:path';
import type { Dirent } from 'node:fs';
import { stat, readdir } from 'node:fs/promises';

const middlewaresDirName = 'middlewares';
const priority = ['src', middlewaresDirName];
const sortDirs = (a: Dirent, b: Dirent) => {
  const aPriority = priority.indexOf(a.name);
  const bPriority = priority.indexOf(b.name);

  if (aPriority !== -1 || bPriority !== -1) {
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;
    return aPriority - bPriority;
  }

  return a.name.localeCompare(b.name);
};

const filterEntries = (entry: Dirent) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules';

export async function findMiddlewaresFolder(): Promise<string | null> {
  const cwd = process.cwd();

  const all = await Promise.all(
    (await readdir(cwd, { withFileTypes: true }))
      .filter(filterEntries)
      .sort(sortDirs)
      .map((entry) => new Promise<string | null>(
        (resolve) => {
          if (entry.name === middlewaresDirName) {
            resolve(join(cwd, entry.name));
          } else {
            const path = join(cwd, entry.name, middlewaresDirName);
            stat(path)
              .then(() => resolve(path))
              .catch(() => resolve(null));
          }
        },
      )));

  return all.find((entry) => entry !== null) || null;
}