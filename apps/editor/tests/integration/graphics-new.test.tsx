import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderEditor } from '../helpers/render-app';
import { server } from '../helpers/server';
import { NewResourceNamespacePage } from '@editor/route/resource/new-namespace';
import { NewResourceByNamespacePage } from '@editor/route/resource/new-by-namespace';
import { EditResourcePage } from '@editor/route/resource/edit';

function renderGraphicsRoutes(initialEntry: string) {
  return renderEditor(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/resources/:type/new" element={<NewResourceNamespacePage />} />
        <Route path="/resources/:namespace/:type/new" element={<NewResourceByNamespacePage />} />
        <Route path="/resources/:namespace/:type/:name" element={<EditResourcePage />} />
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

  it('shows namespace picker for tile type', async () => {
    server.use(
      http.post('/api/namespaces/search', () =>
        HttpResponse.json({
          items: [{ id: 'sample', presenceName: 'Sample', isPrivate: false }],
          hasMore: false,
        })
      )
    );

    renderGraphicsRoutes('/resources/tile/new');

    await waitFor(() => {
      expect(screen.getByText('グループを選んでから編集を始めます')).toBeInTheDocument();
    });
  });
});
