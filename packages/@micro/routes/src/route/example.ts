import { z } from 'zod';
import { route } from '@micro/routes';
import { fromQuery } from '@micro/routes/route/param';

const myRoute = route({
  params: {
    test: fromQuery(z.number()),
  },
}, ({ params: { test } }) => {

});