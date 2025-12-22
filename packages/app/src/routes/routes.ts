import {
  route,
  allFromQuery,
  fromHeader,
  fromQuery,
  HttpStatus,
  HttpResult,
  defineResponse,
} from '@micro/routes';
import { z } from 'zod';
import { isAdmin } from '@app/guards/index.js';


export const getStuff = route({
  use: [isAdmin],
  params: {
    test2: fromQuery(z.string().min(3)),
    test3: fromQuery(z.boolean()),
    test: allFromQuery(z.array(z.number())),
    testAbc: fromQuery(z.string().optional()),
    userAgent: fromHeader(z.string()),
  },
  responses: {
    [HttpStatus.OK]: defineResponse(z.object({
      method: z.string(),
      url: z.string(),
      userAgent: z.array(z.string()),
      args: z.array(z.number()),
      remoteAddress: z.string(),
      test: z.array(z.number()),
      test2: z.string(),
      test3: z.boolean(),
      userAgentFromParams: z.string(),
    })),
  },
}, async ({ req, res, params, app }) => {
  const data = {
    method: req.method,
    url: req.url,
    userAgent: req.headers.getAll('user-agent'),
    args: params.test,
    remoteAddress: req.remoteAddress,
    test: params.test,
    test2: params.test2,
    test3: params.test3,
    userAgentFromParams: params.userAgent,
  };

  return HttpResult.ok(data);
}).openapi({
  tag: 'Example',
  description: 'Just an example endpoint',
  summary: 'Example endpoint',
});