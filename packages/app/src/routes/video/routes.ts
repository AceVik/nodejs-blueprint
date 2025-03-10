import { route } from '@micro/routes';

// POST /video
export const postStuff = route<{id: string}>(async ({ req, res }) => {
  console.log(req);
});