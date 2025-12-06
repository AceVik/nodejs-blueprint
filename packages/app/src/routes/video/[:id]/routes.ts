import { fromPath, route } from '@micro/routes';
import { z } from 'zod';


// GET /video/:id
export const getStuff = route({
  params: {
    id: fromPath(z.uuidv7()),
  },
}, async ({ params: { id } }) => {
  console.log(id);
});


// PUT /video/:id
export const putStuff = route({
}, async ({ req, res }) => {
  console.log(req);
});