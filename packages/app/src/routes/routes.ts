import { route, fromQuery } from '@micro/routes';
import { z } from 'zod';

export const getStuff = route({
  desc: 'Get stuff',
  params: {
    test: fromQuery(z.coerce.number()),
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