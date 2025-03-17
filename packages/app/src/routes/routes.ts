import { route, allFromQuery, fromQuery } from '@micro/routes';
import { z } from 'zod';

export const getStuff = route({
  params: {
    test: allFromQuery(z.array(z.union([z.number(), z.string()]))),
  },
}, async ({ req, res, params }) => {
  res.send(JSON.stringify({
    method: req.method,
    url: req.url,
    userAgent: req.headers.getAll('user-agent'),
    args: req.query.get('test'),
    remoteAddress: req.remoteAddress,
    test: params.test,
  }));
});

