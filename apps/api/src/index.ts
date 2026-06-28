import { Hono } from 'hono';
import 'dotenv/config';
import { resolveUserMiddleware } from './auth/middlewares/resolve-user';
import { authRoute } from './routes/auth';
import { namespacesRoute } from './routes/namespaces';
import { resourcesRoute } from './routes/resources';

const app = new Hono();

app.use('*', resolveUserMiddleware);
app.route('/api/auth', authRoute);
app.route('/api/namespaces', namespacesRoute);
app.route('/api/resources', resourcesRoute);

export default app;
