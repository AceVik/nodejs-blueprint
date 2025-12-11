import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import type { OpenApiExtender } from '../types.js';
import type { RouteMeta } from '../../route/index.js';

/**
 * Creates an OpenAPI extender that applies basic route metadata.
 * Handles normalization of tags (single vs array).
 *
 * @param meta - The route metadata (summary, description, tags, etc.).
 * @returns An OpenApiExtender function.
 */
export function routeMeta(meta: RouteMeta): OpenApiExtender {
  return ({ onExtendRoute }) => {
    onExtendRoute((config: RouteConfig) => {
      const { tag, tags, ...rest } = meta;
      const finalTags = tags ?? (tag ? [tag] : undefined);

      return {
        ...config,
        ...rest,
        tags: finalTags,
      };
    });
  };
}