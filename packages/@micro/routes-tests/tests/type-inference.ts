import { route } from '@micro/routes';
import { fromPath, fromQuery } from '@micro/routes/param';
import { z } from 'zod';

// This file is checks type inference.
// It is not meant to be run by vitest, but checked by tsc.

export const testRoute = route({
  method: 'GET',
  params: {
    id: fromPath(z.string()),
    count: fromQuery(z.coerce.number()),
    optional: fromQuery(z.string().optional()),
  },
}, ({ params }) => {
  // Assert types
  const id: string = params.id;
  const count: number = params.count;
  const optional: string | undefined = params.optional;

  // @ts-expect-error - Should be string
  const wrongId: number = params.id;

  // @ts-expect-error - Should be number
  const wrongCount: string = params.count;


});
