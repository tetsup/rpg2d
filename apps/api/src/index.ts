import { Hono } from 'hono';
import 'dotenv/config';
import { resolveUserMiddleware } from './auth/middlewares/resolve-user';
import { authRoute } from './routes/auth';
import { resourceRoute } from './routes/resource';
import { namespaceRoute } from './routes/namespace';
import { namespacesRoute } from './routes/namespaces';
import { resourcesRoute } from './routes/resources';

const app = new Hono();

app.use('*', resolveUserMiddleware);
app.route('/api/auth', authRoute);
app.route('/api/resource', resourceRoute);
app.route('/api/namespace', namespaceRoute);
app.route('/api/resources', resourcesRoute);
app.route('/api/namespaces', namespacesRoute);

export default app;
