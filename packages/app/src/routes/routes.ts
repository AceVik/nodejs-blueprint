import { route, allFromQuery, fromHeader, fromQuery } from '@micro/routes';
import { z } from 'zod';
import { isAdmin } from '@app/guards/index.js';

export const getStuff = route({
  use: [isAdmin],
  params: {
    test2: fromQuery(z.string().min(3)),
    test3: fromQuery(z.boolean()),
    test: allFromQuery(z.array(z.number())),
    testAbc: fromQuery(z.string().optional()),
    userAgent: fromHeader(z.string()),
  },
}, async ({ req, res, params, app }) => {
  res.send(JSON.stringify({
    method: req.method,
    url: req.url,
    userAgent: req.headers.getAll('user-agent'),
    args: req.query.get('test'),
    remoteAddress: req.remoteAddress,
    test: params.test,
    test2: params.test2,
    test3: params.test3,
    userAgentFromParams: params.userAgent,
    routeName: app.routes[0].name,
    routePath: app.routes[0].path,
  }));
}).openapi({
  tag: 'Example',
  description: 'Just an example endpoint',
  summary: 'Example endpoint',
});