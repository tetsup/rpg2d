import { Hono } from 'hono';
import 'dotenv/config';
import { ApiError } from './errors/http-error';
import { resolveUserMiddleware } from './auth/middlewares/resolve-user';
import { authRoute } from './routes/auth';
import { namespacesRoute } from './routes/namespaces';
import { resourcesRoute } from './routes/resources';

const app = new Hono();

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: 'internal_error' }, 500);
});

app.use('*', resolveUserMiddleware);
app.route('/api/auth', authRoute);
app.route('/api/namespaces', namespacesRoute);
app.route('/api/resources', resourcesRoute);

export default app;
