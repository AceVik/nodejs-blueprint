import type { Middleware } from './middleware.class.js';
import { isOmitMarker, type OmitMarker, omit } from './omit.factory.js';

export type PhaseItem = Middleware | string | symbol | OmitMarker;

export type PhaseArray = PhaseItem[];
export type PhaseObject = {
  inherit?: boolean;
  use?: PhaseArray;
  omit?: (string | symbol)[];
};

export type PhaseConfig = PhaseArray | PhaseObject | undefined;

export type MiddlewaresConfig = {
  before?: PhaseConfig;
  after?: PhaseConfig;
};

export type ResolvedMiddlewaresConfig = {
  before: PhaseArray;
  after: PhaseArray;
};

/**
 * Factory used by app projects to declare global middlewares in object form.
 * Example usage in app: middlewares({ before: [...], after: [...] })
 */
export function middlewares(cfg: MiddlewaresConfig): ResolvedMiddlewaresConfig {
  const normalize = (phase?: PhaseConfig): PhaseArray => {
    if (!phase) return [];
    if (Array.isArray(phase)) return phase.slice();
    const arr: PhaseArray = [];
    if (phase.omit) arr.push(...phase.omit.map((n) => omit(n)));
    if (phase.use) arr.push(...phase.use);
    return arr;
  };

  return {
    before: normalize(cfg.before),
    after: normalize(cfg.after),
  };
}

export function isResolvedMiddlewaresConfig(v: unknown): v is ResolvedMiddlewaresConfig {
  const isArr = (x: any) => Array.isArray(x);
  return !!v && typeof v === 'object' && isArr((v as any).before) && isArr((v as any).after);
}

export { omit, isOmitMarker };
