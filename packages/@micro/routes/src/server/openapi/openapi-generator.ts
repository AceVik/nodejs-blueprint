import { OpenApiGeneratorV31, OpenAPIRegistry, type RouteConfig } from '@asteasolutions/zod-to-openapi';
import { z, type ZodType } from 'zod';
import { type Route, type RouteParam } from '../../route/index.js';
import type { ErrorMiddleware } from '../../middleware/index.js';
import type { InfoObject, OpenAPIObject } from 'openapi3-ts/oas31';

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
      summary: route.name,
      request: {
        params: z.object(
          pathParams.reduce((acc: Record<string, unknown>, curr: any) => {
            const name = (curr as any)._def?.openapi?.param?.name as string | undefined;
            return name ? { ...acc, [name]: curr } : acc;
          }, {}),
        ),
        query: z.object(
          queryParams.reduce((acc: Record<string, unknown>, curr: any) => {
            const name = (curr as any)._def?.openapi?.param?.name as string | undefined;
            return name ? { ...acc, [name]: curr } : acc;
          }, {}),
        ),
        headers: z.object(
          headerParams.reduce((acc: Record<string, unknown>, curr: any) => {
            const name = (curr as any)._def?.openapi?.param?.name as string | undefined;
            return name ? { ...acc, [name]: curr } : acc;
          }, {}),
        ),
      },
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
