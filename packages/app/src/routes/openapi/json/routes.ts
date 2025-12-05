import { route } from '@micro/routes';

export const getOpenApiJson = route({
  meta: {
    tags: ['OpenAPI'],
    description: 'OpenAPI Json schema docs.',
  },
}, async ({ app, res }) => {
  const jsonSchema = app.getOpenApiSchema({
    title: 'Example Docs',
    version: '1.0.0',
  });

  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(jsonSchema, null, 2));
});