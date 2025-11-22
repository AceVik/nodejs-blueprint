import { join } from 'node:path';
import type { Dirent } from 'node:fs';
import { stat, readdir } from 'node:fs/promises';

const routesDirName = 'routes';
const priority = ['src', routesDirName];

/**
 * Sorts directory entries based on priority.
 * 'src' and 'routes' directories are prioritized.
 *
 * @param a - First directory entry.
 * @param b - Second directory entry.
 * @returns Sort order.
 */
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

/**
 * Filters directory entries to include only relevant directories.
 * Excludes hidden directories (starting with '.') and 'node_modules'.
 *
 * @param entry - The directory entry to check.
 * @returns True if the entry is a relevant directory, false otherwise.
 */
const filterEntries = (entry: Dirent) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules';

/**
 * Attempts to find the 'routes' folder in the current working directory or its subdirectories.
 * Prioritizes 'src/routes' and 'routes' in the root.
 *
 * @returns A promise that resolves to the absolute path of the routes folder, or null if not found.
 */
export async function findRoutesFolder(): Promise<string | null> {
  const cwd = process.cwd();

  const entries = await readdir(cwd, { withFileTypes: true });

  const sortedEntries = entries
    .filter(filterEntries)
    .sort(sortDirs);

  const results = await Promise.all(
    sortedEntries.map((entry) => new Promise<string | null>(
      (resolve) => {
        if (entry.name === routesDirName) {
          resolve(join(cwd, entry.name));
        } else {
          const path = join(cwd, entry.name, routesDirName);
          stat(path)
            .then(() => resolve(path))
            .catch(() => resolve(null));
        }
      },
    )));

  return results.find((entry) => entry !== null) || null;
}