import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderEditor } from '../helpers/render-app';
import { server } from '../helpers/server';
import { NewGraphicsResourceNamespacePage } from '@editor/route/graphics/new-namespace';
import { NewGraphicsResourcePage } from '@editor/route/graphics/new';
import { EditGraphicsResourcePage } from '@editor/route/graphics/edit';

function renderGraphicsRoutes(initialEntry: string) {
  return renderEditor(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/resources/:type/new" element={<NewGraphicsResourceNamespacePage />} />
        <Route path="/resources/:namespace/:type/new" element={<NewGraphicsResourcePage />} />
        <Route path="/resources/:namespace/:type/:name" element={<EditGraphicsResourcePage />} />
        <Route path="/resources" element={<div>resources home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('graphics resource create page', () => {
  it('shows namespace picker before the editor', async () => {
    server.use(
      http.post('/api/namespaces/search', () =>
        HttpResponse.json({
          items: [{ id: 'sample', presenceName: 'Sample', isPrivate: false }],
          hasMore: false,
        })
      )
    );

    renderGraphicsRoutes('/resources/image/new');

    await waitFor(() => {
      expect(screen.getByText('グループを選んでから編集を始めます')).toBeInTheDocument();
    });
  });

  it('renders the mobile editor shell for image type', async () => {
    renderGraphicsRoutes('/resources/sample/image/new');

    await waitFor(() => {
      expect(screen.getByRole('toolbar', { name: '描画ツール' })).toBeInTheDocument();
    });

    expect(screen.getByText('＋ボタンから画像を追加してください')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeEnabled();
  });

  it('creates an image with an auto-generated name and navigates to edit', async () => {
    const user = userEvent.setup();
    let postedBody: unknown;

    server.use(
      http.post('/api/resources/search', () =>
        HttpResponse.json({
          items: [],
          hasMore: false,
        })
      ),
      http.post('/api/resources/sample/image/:name', async ({ request }) => {
        postedBody = await request.json();
        return HttpResponse.json({});
      }),
      http.get('/api/resources/sample/image/:name', ({ params }) =>
        HttpResponse.json({
          id: `sample/image/${params.name}`,
          namespace: 'sample',
          type: 'image',
          name: params.name,
          version: 0,
          isDraft: true,
          data: {
            size: { width: 16, height: 16 },
            palette: { ff: [0, 0, 0, 0] },
            pixels: Array(16).fill(Array(16).fill('ff').join(' ')),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'test-user',
        })
      )
    );

    renderGraphicsRoutes('/resources/sample/image/new');

    await user.click(await screen.findByRole('button', { name: '追加' }));
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(postedBody).toMatchObject({
        namespace: 'sample',
        type: 'image',
        version: 0,
        isDraft: true,
        data: {
          size: { width: 16, height: 16 },
        },
      });
    });

    const body = postedBody as { name: string };
    expect(body.name).toBe('aa');

    await waitFor(() => {
      expect(screen.getByRole('toolbar', { name: '描画ツール' })).toBeInTheDocument();
    });
  });

  it('redirects unsupported resource types to /resources', async () => {
    renderGraphicsRoutes('/resources/tile/new');

    await waitFor(() => {
      expect(screen.getByText('resources home')).toBeInTheDocument();
    });
  });
});
