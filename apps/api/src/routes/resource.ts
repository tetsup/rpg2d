import { Hono } from 'hono';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ResourceParamsSchema } from '@schema/api/resource';
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
    const { namespace, type, id } = parseParams(ResourceParamsSchema, c.req.param());
    const resource = resourceLoader.readResource(namespace, type, id);
    return resource;
  })
);

export { resourceRoute };
