import { route, allFromQuery, fromHeader, fromQuery } from '@micro/routes';
import { z } from 'zod';

export const getStuff = route({
  params: {
    test: allFromQuery(z.array(z.number())),
    test2: fromQuery(z.string().min(3)),
    test3: fromQuery(z.boolean()),
    testAbc: fromQuery(z.string().optional()).openapi({ description: 'Test optional query param', deprecated: true }),
    userAgent: fromHeader(z.string()),
  },
  // Gives middlewares and order executed before handler
  /*
  before: [
    checkIsAdmin,
    checkHasRole('admin'),
    `${MAIN_MIDDLEWARE.name}`,
    checkHasPermission('readStuff'),
  ],*/
  // Gives middlewares and order executed after handler
  /*
  after: [
    transformFileResponseToStream,
    appendSpecialHeaders,
  ],*/
  // How to give error middlewares?
  // What could be else interesting for a full capability of an api route?
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
    testAbc: testAbcSchema.description || 'sggfgdgfg',
    userAgentFromParams: params.userAgent,
    routeName: app.routes[0].name,
    routePath: app.routes[0].path,
  }));
}).openapi({

});