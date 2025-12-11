import type { OpenAPIRegistry, RouteConfig } from '@asteasolutions/zod-to-openapi';
import type { Awaitable } from '../types/index.js';

/**
 * The function that actually modifies the configuration.
 */
export type OpenApiRouteExtender = (config: RouteConfig) => Awaitable<RouteConfig>;

/**
 * The hooks object passed to the extender.
 * Allows registering modifications.
 */
export type OpenApiExtenderHooks = {
  /**
   * Registers a function to extend or modify the route configuration.
   * @param extender - The callback function that receives the current config and returns the new one.
   */
  onExtendRoute: (extender: OpenApiRouteExtender) => Awaitable<void>;
};

/**
 * The main extender function signature.
 */
export type OpenApiExtender = (hooks: OpenApiExtenderHooks, registry: OpenAPIRegistry) => Awaitable<void>;