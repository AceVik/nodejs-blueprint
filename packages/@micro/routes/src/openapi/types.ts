import type { OpenAPIRegistry, RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Awaitable } from '../types/index.js';
import { RouteParamType } from '../route/param/route-param-types.type.js';
import { RouteParamMeta } from '../route/param/route-param-meta.type.js';
import { Route } from '../route/route.class.js';
import { RouteParam } from '../route/param/route-param.class.js';

/**
 * The function that actually modifies the route configuration.
 * Receives the current config AND the Route instance.
 */
export type OpenApiRouteExtender = (config: RouteConfig, route: Route<never>) => Awaitable<RouteConfig>;

/**
 * The function that modifies/extends parameter metadata.
 * Receives the current meta (or empty object) AND the RouteParam instance.
 */
export type OpenApiParamMetaExtender<PT extends RouteParamType> =
  (currentMeta: RouteParamMeta<PT>, param: RouteParam<any, PT>) => RouteParamMeta<PT>;

export type OpenApiExtenderHooks = {
  /**
   * Registers a function to extend or modify the route configuration.
   */
  onExtendRoute: (extender: OpenApiRouteExtender) => void;

  /**
   * Registers a function (or object) to extend the parameter metadata.
   * * @param metaOrExtender - Either a direct Meta object (merge) or a callback function (logic).
   */
  onExtendParamMeta: <PT extends RouteParamType>(
    metaOrExtender: RouteParamMeta<PT> | OpenApiParamMetaExtender<PT>
  ) => void;
};

export type OpenApiExtender = (hooks: OpenApiExtenderHooks, registry: OpenAPIRegistry) => Awaitable<void>;