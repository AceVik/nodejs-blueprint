import { route } from '@micro/routes';
import { fromQuery } from '@micro/routes/route/param';
import { z } from '@micro/routes/zod';

const myRoute = route({
  params: {
    test: fromQuery(z.number()),
  },
}, ({ params: { test } }) => {

});