import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { resolveUserMiddleware } from './auth/middlewares/resolve-user';
import { authRoute } from './routes/auth';
import { namespacesRoute } from './routes/namespaces';
import { resourcesRoute } from './routes/resources';
import { createCorsOriginValidator } from './utils/frontend-origin';

const app = new Hono();

app.use(logger());
app.use(
  '*',
  cors({
    origin: createCorsOriginValidator(),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
);
app.use('*', resolveUserMiddleware);
app.route('/api/auth', authRoute);
app.route('/api/namespaces', namespacesRoute);
app.route('/api/resources', resourcesRoute);

export default app;
