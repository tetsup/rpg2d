import { Hono } from 'hono';
import { resourceRoute } from './routes/resource';
import { authRoute } from './routes/auth';
import { resolveUserMiddleware } from './auth/middlewares/resolve-user';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '',
    credentials: true,
  })
);
app.use('*', resolveUserMiddleware);
app.route('/api/auth', authRoute);
app.route('/api/resource', resourceRoute);

export default app;
