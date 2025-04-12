import { route, allFromQuery, fromHeader, fromQuery } from '@micro/routes';
import { z } from 'zod';

export const getStuff = route({
  params: {
    test: allFromQuery(z.array(z.number())),
    test2: fromQuery(z.string()),
    test3: fromQuery(z.boolean()),
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
});