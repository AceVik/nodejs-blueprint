import { OpenApiGeneratorV31, OpenAPIRegistry, type RouteConfig } from '@asteasolutions/zod-to-openapi';
import { z, type ZodType } from 'zod';
import type { Route, RouteParam } from '../../route/index.js';
import type { ErrorMiddleware } from '../../middleware/index.js';
import type { InfoObject, OpenAPIObject } from 'openapi3-ts/oas31';
import { RouteParamType } from '../../route/param/route-param-types.type.js';

export class OpenApiGenerator {
  private readonly registry: OpenAPIRegistry;

  constructor() {
    this.registry = new OpenAPIRegistry();
  }

  public generate(info: InfoObject, routes: readonly Route<never>[], errorMiddlewares: Record<string | symbol, ErrorMiddleware>): OpenAPIObject {
    const allMiddlewares = this.getAllMiddlewares(errorMiddlewares);

    this.registerSharedSchemas(allMiddlewares);

    for (const route of routes) {
      this.registerRoute(route, allMiddlewares);
    }

    const builder = new OpenApiGeneratorV31(this.registry.definitions);
    return builder.generateDocument({
      openapi: '3.1.0',
      info,
    });
  }

  private getAllMiddlewares(middlewareMap: Record<string | symbol, ErrorMiddleware>): ErrorMiddleware[] {
    return Reflect.ownKeys(middlewareMap)
      .map((key) => middlewareMap[key as keyof typeof middlewareMap])
      .filter((mw): mw is ErrorMiddleware => !!mw);
  }

  private registerSharedSchemas(middlewares: ErrorMiddleware[]) {
    const registeredIds = new Set<string>();

    for (const emw of middlewares) {
      for (const schema of Object.values(emw.responses)) {
        const def = (schema as any)._def;
        const refId = def?.openapi?.refId ?? def?.openapi?.metadata?.refId;

        if (refId && !registeredIds.has(refId)) {
          this.registry.register(refId, schema);
          registeredIds.add(refId);
        }
      }
    }
  }

  private registerRoute(route: Route<never>, middlewares: ErrorMiddleware[]) {
    const openApiPath = route.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

    const basicConfig = this.getRouteBasicConfig(route, openApiPath);
    const requestConfig = this.getRequestConfig(route);
    const errorResponses = this.getErrorResponses(middlewares);

    const routeConfig: RouteConfig = {
      ...basicConfig,
      ...requestConfig,
      responses: {
        200: {
          description: 'Successful response',
        },
        ...errorResponses,
      },
    };

    this.registry.registerPath(routeConfig);
  }

  private getRouteBasicConfig(route: Route<never>, openApiPath: string): Pick<RouteConfig, 'method' | 'path' | 'tags' | 'summary' | 'description' | 'deprecated'> {
    return {
      method: (route.method.toLowerCase?.() ?? String(route.method).toLowerCase()) as RouteConfig['method'],
      path: openApiPath,
      tags: route.meta?.tags,
      summary: route.meta?.summary ?? route.name,
      description: route.meta?.description,
      deprecated: route.meta?.deprecated,
    };
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

        // Nutzung der Type Guards für sauberes Routing
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
    // 1. Basis-Metadaten (Common)
    const baseMeta = {
      description: param.meta?.description || param.schema.description,
      deprecated: param.meta?.deprecated,
    };

    // 2. Example Handling (XOR logic)
    const exampleMeta: any = {};
    if (param.meta && 'examples' in param.meta && param.meta.examples) {
      exampleMeta.examples = param.meta.examples;
    } else if (param.meta && 'example' in param.meta && param.meta.example) {
      exampleMeta.example = param.meta.example;
    } else if (param.schema.description) {
      // Fallback: Zod description als Example (Optional, je nach Präferenz)
      exampleMeta.example = param.schema.description;
    }

    // 3. Typspezifische Parameter-Konfiguration via Type Guards
    const paramConfig: any = {
      name: primaryName,
      in: param.type,
    };

    if (param.isPath()) {
      // Path Parameter sind IMMER required und haben eingeschränkte Styles
      paramConfig.required = true;
      paramConfig.style = param.meta?.style;
      paramConfig.explode = param.meta?.explode;

    } else if (param.isQuery()) {
      // Query Parameter haben die meisten Optionen
      paramConfig.required = this.calculateRequired(param);
      paramConfig.allowEmptyValue = param.meta?.allowEmptyValue ?? param.schema.safeParse('').success;
      paramConfig.allowReserved = param.meta?.allowReserved;
      paramConfig.style = param.meta?.style;
      paramConfig.explode = param.meta?.explode;

    } else if (param.isHeader()) {
      paramConfig.required = this.calculateRequired(param);
      paramConfig.style = param.meta?.style;
      paramConfig.explode = param.meta?.explode;

    } else if (param.isCookie()) {
      paramConfig.required = this.calculateRequired(param);
      paramConfig.style = param.meta?.style;
      paramConfig.explode = param.meta?.explode;
    }

    // 4. Zusammenfügen
    return param.schema.openapi({
      ...baseMeta,
      ...exampleMeta,
      param: paramConfig,
    });
  }

  /**
   * Helper to determine if a parameter is required based on Zod schema.
   * Path parameters are handled separately (always true).
   */
  private calculateRequired(param: RouteParam<unknown, RouteParamType>): boolean {
    // Wenn allowEmptyValue true ist, ist es technisch nicht "required" im Sinne von "muss Daten haben",
    // aber OpenAPI 'required' bedeutet "muss im Request vorhanden sein".
    // Hier prüfen wir einfach, ob 'undefined' ein valider Input wäre.
    return !param.schema.safeParse(undefined).success;
  }

  private getErrorResponses(middlewares: ErrorMiddleware[]): RouteConfig['responses'] {
    const responses: RouteConfig['responses'] = {};

    for (const emw of middlewares) {
      for (const [status, schema] of Object.entries(emw.responses)) {
        responses[status] = {
          description: `Error response for ${status}`,
          content: {
            'application/json': {
              schema: schema as ZodType,
            },
          },
        };
      }
    }

    return responses;
  }
}