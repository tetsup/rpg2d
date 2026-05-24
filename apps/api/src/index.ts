import { Hono } from 'hono';
import { resourceRoute } from './routes/resource';
import { authRoute } from './routes/auth';
import { resolveUserMiddleware } from './auth/resolve-user';

const app = new Hono();

app.use('*', resolveUserMiddleware);
app.route('/api/auth', authRoute);
app.route('/api/resource', resourceRoute);

export default app;
