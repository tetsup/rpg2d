import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ResourceSearchReqSchema } from '@api/schemas/resources/search/get-schema';
import { ResourceGetReqSchema } from '@api/schemas/resources/by-id/get-schema';
import { resourceRepository } from '@api/db/search-resources';
import { LocalLoader } from '../loaders/local-loader';
import { handle } from '../utils/handle';
import { parseParams } from '../utils/params';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resourceDir = path.resolve(__dirname, '../../../../fixtures/resources/sample');

const resourceLoader = new LocalLoader(resourceDir);

const resourceRoute = new Hono();

resourceRoute.get(
  '/:namespace/:type/:id',
  handle(async (c) => {
    const { namespace, type, id } = parseParams(ResourceGetReqSchema, c.req.param());
    const resource = resourceLoader.readResource(namespace, type, id);
    return resource;
  })
);

resourceRoute.get('/search/', zValidator('query', ResourceSearchReqSchema), async (c) => {
  const query = c.req.valid('query');
  const result = await resourceRepository.list({
    query: query.q,
    type: query.type,
    cursor: query.cursor,
    limit: query.limit,
  });
  return c.json(result);
});

export { resourceRoute };
