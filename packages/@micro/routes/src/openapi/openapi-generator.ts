import { OpenApiGeneratorV31, OpenAPIRegistry, type RouteConfig } from '@asteasolutions/zod-to-openapi';
import { z, type ZodType } from 'zod';
import type { Route, RouteParam } from '../route/index.js';
import type { InfoObject, OpenAPIObject } from 'openapi3-ts/oas31';
import { RouteParamType } from '../route/param/route-param-types.type.js';
import type { OpenApiExtenderHooks, OpenApiRouteExtender } from './types.js';

/**
 * Generates OpenAPI 3.1 documentation from the registered routes and middlewares.
 * Orchestrates parameter extraction, security scheme registration via guards, and schema generation.
 */
export class OpenApiGenerator {
  private readonly registry: OpenAPIRegistry;

  constructor() {
    this.registry = new OpenAPIRegistry();
  }

  /**
   * Generates the full OpenAPI document.
   *
   * @param info - The general API information (title, version, etc.).
   * @param routes - The list of registered routes.
   * @returns The complete OpenAPI object.
   */
  public async generate(info: InfoObject, routes: readonly Route<never>[]): Promise<OpenAPIObject> {
    for (const route of routes) {
      await this.registerRoute(route);
    }

    const builder = new OpenApiGeneratorV31(this.registry.definitions);
    return builder.generateDocument({
      openapi: '3.1.0',
      info,
    });
  }

  private async registerRoute(route: Route<never>) {
    const openApiPath = route.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

    // 1. Build Base Configuration
    const baseConfig: RouteConfig = {
      method: (route.method.toLowerCase?.() ?? String(route.method).toLowerCase()) as RouteConfig['method'],
      path: openApiPath,
      ...this.getRequestConfig(route),
      responses: {
        ...this.getSuccessResponse(route),
      },
    };

    // 2. Apply Interceptor/Guard Modifications AND Route Metadata (via OpenApiBase mechanism)
    const finalConfig = await this.applyOpenApiHooks(route, baseConfig);

    this.registry.registerPath(finalConfig);
  }

  /**
   * Collects and executes all OpenAPI extenders from the Route and its Interceptors.
   */
  private async applyOpenApiHooks(route: Route<never>, config: RouteConfig): Promise<RouteConfig> {
    let currentConfig = { ...config };
    const routeExtenders: OpenApiRouteExtender[] = [];

    // Define the hooks implementation that collects callbacks
    const hooks: OpenApiExtenderHooks = {
      onExtendRoute: (extender) => {
        routeExtenders.push(extender);
      },
      onExtendParamMeta: () => {
        // Parameter meta extension is usually handled within the Param classes directly,
        // but we satisfy the interface here.
      },
    };

    // 1. Collect extenders from Interceptors (Guards, etc.)
    const allInterceptors = [...route.beforeInterceptors, ...route.afterInterceptors];
    for (const interceptor of allInterceptors) {
      // Check if the interceptor has an initOpenapi function (inherited from OpenApiBase)
      if (typeof (interceptor as any).initOpenapi === 'function') {
        await (interceptor as any).initOpenapi(hooks, this.registry);
      }
    }

    // 2. Collect extender from the Route itself (e.g., .openapi({ summary: '...' }))
    if (route.initOpenapi) {
      await route.initOpenapi(hooks, this.registry);
    }

    // 3. Execute all collected route configuration modifiers sequentially
    for (const extender of routeExtenders) {
      currentConfig = await extender(currentConfig, route);
    }

    return currentConfig;
  }

  private getRequestConfig(route: Route<never>): Pick<RouteConfig, 'request'> {
    const queryShape: Record<string, ZodType> = {};
    const headerShape: Record<string, ZodType> = {};
    const cookieShape: Record<string, ZodType> = {};
    const pathShape: Record<string, ZodType> = {};

    if (route.params) {
      const params = route.params as Record<string, RouteParam<unknown, RouteParamType>>;

      for (const [key, param] of Object.entries(params)) {
        const primaryName = param.names?.[0] ?? key;
        const schema = this.enrichSchemaWithMeta(param, primaryName);

        if (param.isQuery()) {
          queryShape[primaryName] = schema;
        } else if (param.isHeader()) {
          headerShape[primaryName] = schema;
        } else if (param.isPath()) {
          pathShape[primaryName] = schema;
        } else if (param.isCookie()) {
          cookieShape[primaryName] = schema;
        }
      }
    }

    this.fillMissingPathParams(route.path, pathShape);

    const hasQuery = Object.keys(queryShape).length > 0;
    const hasPath = Object.keys(pathShape).length > 0;
    const hasHeader = Object.keys(headerShape).length > 0;
    const hasCookie = Object.keys(cookieShape).length > 0;

    if (!hasQuery && !hasPath && !hasHeader && !hasCookie) {
      return {};
    }

    return {
      request: {
        query: hasQuery ? z.object(queryShape) : undefined,
        params: hasPath ? z.object(pathShape) : undefined,
        headers: hasHeader ? z.object(headerShape) : undefined,
        cookies: hasCookie ? z.object(cookieShape) : undefined,
      },
    };
  }

  private getSuccessResponse(route: Route<never>): RouteConfig['responses'] {
    if (!route.output) {
      return {
        200: {
          description: 'Successful response',
        },
      };
    }

    return {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: route.output,
          },
        },
      },
    };
  }

  private fillMissingPathParams(originalPath: string, pathShape: Record<string, ZodType>) {
    const matches = originalPath.matchAll(/:([a-zA-Z0-9_]+)/g);
    for (const match of matches) {
      const paramName = match[1];
      if (paramName && !pathShape[paramName]) {
        pathShape[paramName] = z.string().openapi({
          param: {
            name: paramName,
            in: 'path',
            required: true,
          },
        });
      }
    }
  }

  private enrichSchemaWithMeta(param: RouteParam<unknown, RouteParamType>, primaryName: string): ZodType {
    const baseMeta = {
      description: param.meta?.description || param.schema.description,
      deprecated: param.meta?.deprecated,
    };

    const exampleMeta: any = {};
    if (param.meta && 'examples' in param.meta && param.meta.examples) {
      exampleMeta.examples = param.meta.examples;
    } else if (param.meta && 'example' in param.meta && param.meta.example) {
      exampleMeta.example = param.meta.example;
    } else if (param.schema.description) {
      exampleMeta.example = param.schema.description;
    }

    const paramConfig: any = {
      name: primaryName,
      in: param.type,
    };

    if (param.isPath()) {
      paramConfig.required = true;
      paramConfig.style = param.meta?.style;
      paramConfig.explode = param.meta?.explode;
    } else {
      paramConfig.required = this.calculateRequired(param);
      paramConfig.style = param.meta?.style;
      paramConfig.explode = param.meta?.explode;

      if (param.isQuery()) {
        paramConfig.allowEmptyValue = param.meta?.allowEmptyValue ?? param.schema.safeParse('').success;
        paramConfig.allowReserved = param.meta?.allowReserved;
      }
    }

    return param.schema.openapi({
      ...baseMeta,
      ...exampleMeta,
      param: paramConfig,
    });
  }

  private calculateRequired(param: RouteParam<unknown, RouteParamType>): boolean {
    return !param.schema.safeParse(undefined).success;
  }
}