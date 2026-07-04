import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderEditor } from '../helpers/render-app';
import { server } from '../helpers/server';
import { EditResourcePage } from '@editor/route/resource/edit';

const imageResource = {
  id: 'sample/image/hero.down1.v0',
  namespace: 'sample',
  type: 'image',
  name: 'hero.down1.v0',
  version: 0,
  isDraft: true,
  data: {
    size: { width: 2, height: 2 },
    palette: {
      aa: [0, 0, 0, 255],
      bb: [255, 0, 0, 255],
    },
    pixels: ['aa aa', 'aa aa'],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'test-user',
};

describe('image graphics editor', () => {
  it('saves isDraft changes independently via partial save', async () => {
    const user = userEvent.setup();
    let putBody: unknown;

    server.use(
      http.get('/api/resources/sample/image/hero.down1.v0', () => HttpResponse.json(imageResource)),
      http.put('/api/resources/sample/image/hero.down1.v0', async ({ request }) => {
        putBody = await request.json();
        return HttpResponse.json({});
      })
    );

    renderEditor(
      <MemoryRouter initialEntries={['/resources/sample/image/hero.down1.v0']}>
        <Routes>
          <Route path="/resources/:namespace/:type/:name" element={<EditResourcePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '画像' })).toBeDisabled();
    });

    await user.click(screen.getAllByRole('button', { name: '画像情報' })[0]);
    await user.click(screen.getByRole('button', { name: '正式' }));
    await user.click(screen.getByRole('button', { name: '閉じる' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '画像' })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: '画像' }));

    await waitFor(() => {
      expect(putBody).toMatchObject({
        namespace: 'sample',
        type: 'image',
        name: 'hero.down1.v0',
        isDraft: false,
      });
    });
  });
});
