import { route } from '@micro/routes';

// POST /video
export const postStuff = route(async ({ req, res }) => {
  console.log(req);
});