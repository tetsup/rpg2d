import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const testUser = {
  id: 'user-test-1',
  name: 'Test User',
  presenceName: 'Test User',
  email: 'test@example.com',
};

export const server = setupServer(
  http.get('/api/auth/me', () => HttpResponse.json(testUser)),
  http.post('/api/namespaces', async () => HttpResponse.json({})),
  http.get('/api/namespaces/:id', ({ params }) =>
    HttpResponse.json({
      id: params.id,
      presenceName: 'Test Group',
      description: 'A test namespace',
      isPrivate: false,
    })
  )
);
