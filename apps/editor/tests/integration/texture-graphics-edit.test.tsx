import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderEditor } from '../helpers/render-app';
import { server } from '../helpers/server';
import { EditGraphicsResourcePage } from '@editor/route/graphics/edit';

const textureResource = {
  id: 'sample/texture/hero.down',
  namespace: 'sample',
  type: 'texture',
  name: 'hero.down',
  version: 0,
  isDraft: true,
  data: {
    layers: [{ priority: 8, images: ['sample/image/hero.down-aa'] }],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'test-user',
};

const frameResource = {
  id: 'sample/image/hero.down-aa',
  namespace: 'sample',
  type: 'image',
  name: 'hero.down-aa',
  version: 0,
  isDraft: true,
  data: {
    size: { width: 2, height: 2 },
    palette: { aa: [0, 0, 0, 255], ff: [0, 0, 0, 0] },
    pixels: ['aa aa', 'aa aa'],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'test-user',
};

describe('texture graphics context editor', () => {
  it('shows frame context and reserves a new frame on add', async () => {
    const user = userEvent.setup();
    let postedBody: unknown;

    server.use(
      http.get('/api/resources/sample/texture/hero.down', () => HttpResponse.json(textureResource)),
      http.get('/api/resources/sample/image/hero.down-aa', () => HttpResponse.json(frameResource)),
      http.post('/api/resources/search', () =>
        HttpResponse.json({
          items: [textureResource, frameResource],
          hasMore: false,
        })
      ),
      http.post('/api/resources/sample/image/:name', async ({ request }) => {
        postedBody = await request.json();
        return HttpResponse.json({});
      })
    );

    renderEditor(
      <MemoryRouter initialEntries={['/resources/sample/texture/hero.down']}>
        <Routes>
          <Route path="/resources/:namespace/:type/:name" element={<EditGraphicsResourcePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /フレーム: aa/ })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '追加' }));
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(postedBody).toMatchObject({
        namespace: 'sample',
        type: 'image',
        name: 'hero.down-ab',
        isDraft: true,
      });
    });
  });
});
