import { route, fromQuery } from '@micro/routes';
import { z } from 'zod';

const myRoute = route({
  params: {
    test: fromQuery(z.number()),
  },
}, ({ params: { test } }) => {
  if (test === 3) {
    console.log('test is 3');
  }
});


export const getStuff = route({
  desc: 'Get stuff',
  params: {
    test: fromQuery(z.number()),
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