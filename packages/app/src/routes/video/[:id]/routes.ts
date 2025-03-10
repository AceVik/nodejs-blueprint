import { bodyParam, headerParam, pathParam, queryParam, route } from '@micro/routes';
import zod from 'zod';


type GetStuffParams = {
  id: number;
  page: number;
  contentType: string;
};

// GET /video/:id
export const getStuff = route<GetStuffParams>({
  desc: 'Get stuff',
  params: {
    id: pathParam(zod.number().int().gte(1)),
    page: queryParam(zod.number().int().gte(1).optional().default(1)),
    contentType: headerParam('content-type', zod.string()),
  },
}, async ({ contentType }) => {
  console.log(contentType);
});


type PutStuffParams = {
  id: number;
  file: File;
};

// PUT /video/:id
export const putStuff = route<PutStuffParams>({
  params: {
    id: pathParam(zod.number().int().gte(1)),
    file: bodyParam((value) => value),
  },
}, async ({ req, res, id, file }) => {
  console.log(req);
});