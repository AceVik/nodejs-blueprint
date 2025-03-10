import { route } from '@micro/routes';


// GET /video/:id
export const getStuff = route(async ({ res, req }) => {

});


// PUT /video/:id
export const putStuff = route({
}, async ({ req, res }) => {
  console.log(req);
});