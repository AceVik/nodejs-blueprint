import { OpenApiGeneratorV31, OpenAPIRegistry, type RouteConfig } from '@asteasolutions/zod-to-openapi';
import { type ZodType } from 'zod';
import { type Route, type RouteParam } from '../../route/index.js';
import type { ErrorMiddleware } from '../../middleware/index.js';
import type { InfoObject, OpenAPIObject, ParameterObject, SchemaObject } from 'openapi3-ts/oas31';

export class OpenApiGenerator {
  private readonly registry: OpenAPIRegistry;

  constructor() {
    this.registry = new OpenAPIRegistry();
  }

  public generate(info: InfoObject, routes: readonly Route<never>[], errorMiddlewares: Record<string | symbol, ErrorMiddleware>): OpenAPIObject {
    for (const route of routes) {
      this.registerRoute(route, errorMiddlewares);
    }

    const builder = new OpenApiGeneratorV31(this.registry.definitions);
    return builder.generateDocument({
      openapi: '3.0.0',
      info,
    });
  }

  private registerRoute(route: Route<never>, errorMiddlewares: Record<string | symbol, ErrorMiddleware>) {
    const pathParams: ZodType[] = [];
    const queryParams: ZodType[] = [];
    const headerParams: ZodType[] = [];

    if (route.params) {
      for (const [name, param] of Object.entries(route.params as Record<string, RouteParam<never>>)) {
        const schema = param.schema.openapi({
          param: {
            name,
            in: param.type,
            required: !param.schema.safeParse(undefined).success,
          },
        });

        switch (param.type) {
        case 'path': pathParams.push(schema); break;
        case 'query': queryParams.push(schema); break;
        case 'header': headerParams.push(schema); break;
        }
      }
    }

    const openApiPath = route.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

    const routeConfig: RouteConfig = {
      method: (route.method.toLowerCase?.() ?? String(route.method).toLowerCase()) as RouteConfig['method'],
      path: openApiPath,
      tags: route.meta?.tags,
      summary: route.meta?.summary ?? route.name,
      description: route.meta?.description,
      deprecated: route.meta?.deprecated,
      parameters: Object.entries((route.params ?? {}) as Record<string, RouteParam<never>>).map((([name, p]) => {
        return {
          name: p.names?.[0] ?? name,
          in: p.type,
          required: !p.schema.safeParse(undefined).success,
          schema: p.schema.openapi(p.meta ?? {}, {  }),
          description: p.meta?.description || p.schema.meta()?.description || p.schema.description,
          deprecated: p.meta?.deprecated || p.schema.meta()?.deprecated,
          example: p.schema.meta()?.title,
          allowEmptyValue: p.schema.safeParse('').success,
        } satisfies ParameterObject;
      })),
      responses: {
        200: {
          description: 'Successful response',
        },
      },
    };

    for (const emw of Object.values(errorMiddlewares)) {
      for (const [status, schema] of Object.entries(emw.responses)) {
        routeConfig.responses[status] = {
          description: `Error: ${status}`,
          content: {
            'application/json': {
              schema,
            },
          },
        };
      }
    }

    this.registry.registerPath(routeConfig);
  }
}
