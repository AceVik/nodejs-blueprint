import type { AppOptions } from 'uWebSockets.js';

export type WorkerOptions = AppOptions & {
  /**
   * Path to the 'routes' directory.
   * Defaults findRoutesFolder is used to find the 'routes' directory in current working directory and inside its directories at first level.
   */
  routesPath?: string;
};