import { route } from '@micro/routes';

export const getOpenApiJson = route(async ({ app, res }) => {
  const jsonSchema = await app.getOpenApiSchema({
    title: 'Example Docs',
    version: '1.0.0',
  });

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(jsonSchema, null, 2));
}).openapi({
  tags: ['OpenAPI'],
  description: 'OpenAPI Json schema docs.',
});