import { WorkerOptions } from './worker-options.type';

export type CreateRoutesAppOptions = WorkerOptions & {
  /**
   * Number of workers to spawn. Defaults to the number of CPUs. Set to <= 1 to disable clustering.
   */
  workers?: number;
};