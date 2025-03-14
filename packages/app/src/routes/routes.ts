import { route } from '@micro/routes';

export const tagsMeta = [
  {
    name: 'Stuff',
    description: 'Stuff operations',
  },
];

// GET /
export const getStuff = route({
  desc: 'Get stuff',
}, async ({ req, res }) => {
  res.send(JSON.stringify({
    method: req.method,
    url: req.url,
    userAgent: req.headers.getAll('user-agent'),
    args: req.query.getAll('test'),
    remoteAddress: req.remoteAddress,
  }));
});

// POST /
export const postStuff = route(async ({ req, res }) => {
  console.log(req);
});