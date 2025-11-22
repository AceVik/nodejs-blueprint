import { route } from '@micro/routes';

// GET /
export const getStuff = route({
  method: 'GET',
}, async ({ req }) => {
  console.log(req);
});

// POST /
export const postStuff = route(async ({ req, res }) => {
  console.log(req);
});